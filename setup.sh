#!/usr/bin/env bash
# Copyright 2026 Golden Retriever Blog Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -euo pipefail

# Golden Retriever Blog - GKE Setup & Deployment Script

info() {
  echo -e "\033[1;34m[INFO]\033[0m $1"
}

error() {
  echo -e "\033[1;31m[ERROR]\033[0m $1" >&2
}

# Check required CLI tools
REQUIRED_COMMANDS=("gcloud" "terraform" "docker" "kubectl")
for cmd in "${REQUIRED_COMMANDS[@]}"; do
  if ! command -v "$cmd" &> /dev/null; then
    error "Required command '$cmd' is not installed or not in PATH."
    exit 1
  fi
done

# Configuration variables
PROJECT_ID="${GCP_PROJECT_ID:-${1:-}}"
REGION="${GCP_REGION:-europe-west1}"
IMAGE_TAG="${IMAGE_TAG:-v1.0.0}"

if [ -z "$PROJECT_ID" ]; then
  PROJECT_ID=$(gcloud config get-value project 2>/dev/null || true)
fi

if [ -z "$PROJECT_ID" ]; then
  error "Project ID is required. Please set GCP_PROJECT_ID environment variable or pass it as first argument."
  echo "Usage: ./setup.sh <PROJECT_ID>"
  exit 1
fi

info "Using GCP Project ID: ${PROJECT_ID}"
info "Using Region: ${REGION}"
info "Using Image Tag: ${IMAGE_TAG}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IAC_DIR="${SCRIPT_DIR}/iac"
K8S_DIR="${SCRIPT_DIR}/k8s"
APP_DIR="${SCRIPT_DIR}/blog-app"

# Step 1: Provision Infrastructure with Terraform
info "1/5 Provisioning Infrastructure via Terraform..."
cd "${IAC_DIR}"

terraform init

info "Applying Terraform configuration..."
terraform apply -auto-approve \
  -var="project_id=${PROJECT_ID}" \
  -var="region=${REGION}"

CLUSTER_NAME=$(terraform output -raw gke_cluster_name)
DB_PRIVATE_IP=$(terraform output -raw cloud_sql_private_ip)
DB_PASS=$(terraform output -raw cloud_sql_db_password)
ARTIFACT_REPO_URL=$(terraform output -raw artifact_repository_url)

cd "${SCRIPT_DIR}"

info "Terraform provisioning complete."
info "GKE Cluster: ${CLUSTER_NAME}"
info "Cloud SQL Private IP: ${DB_PRIVATE_IP}"
info "Artifact Registry URL: ${ARTIFACT_REPO_URL}"

# Step 2: Build and Push Docker Image
info "2/5 Building and pushing Docker container image..."
IMAGE_FULL_NAME="${ARTIFACT_REPO_URL}/golden-retriever-blog:${IMAGE_TAG}"

info "Configuring Docker authentication for GCP..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

info "Building Docker image: ${IMAGE_FULL_NAME}..."
docker build -t "${IMAGE_FULL_NAME}" "${APP_DIR}"

info "Pushing Docker image to Artifact Registry..."
docker push "${IMAGE_FULL_NAME}"

# Step 3: Get GKE Cluster Credentials
info "3/5 Fetching GKE cluster credentials..."
gcloud container clusters get-credentials "${CLUSTER_NAME}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}"

# Step 4: Deploy Kubernetes Manifests
info "4/5 Applying Kubernetes manifests..."

info "Applying Namespace..."
kubectl apply -f "${K8S_DIR}/namespace.yaml"

info "Applying ConfigMap with DB_HOST=${DB_PRIVATE_IP}..."
sed "s/DB_HOST: .*/DB_HOST: \"${DB_PRIVATE_IP}\"/" "${K8S_DIR}/configmap.yaml" | kubectl apply -f -

info "Applying Secret..."
sed "s/DB_PASS: .*/DB_PASS: \"${DB_PASS}\"/" "${K8S_DIR}/secret.yaml.example" | kubectl apply -f -

info "Applying Deployment with image=${IMAGE_FULL_NAME}..."
sed "s|image: .*|image: ${IMAGE_FULL_NAME}|" "${K8S_DIR}/deployment.yaml" | kubectl apply -f -

info "Applying Service..."
kubectl apply -f "${K8S_DIR}/service.yaml"

info "Applying NetworkPolicy..."
kubectl apply -f "${K8S_DIR}/network-policy.yaml"

# Step 5: Verification & Deployment Rollout Status
info "5/5 Verifying deployment status..."
kubectl rollout status deployment/golden-blog-app -n golden-blog --timeout=300s || true

info "Deployment completed successfully!"
info "Service details:"
kubectl get svc golden-blog-service -n golden-blog
