# Kubernetes Deployment Instructions - Golden Retriever Blog

This directory contains the Kubernetes manifests required to deploy the **Golden Retriever Blog** application on a **GKE Autopilot** cluster.

## Automated Deployment (Recommended)

You can deploy the full stack automatically using the `setup.sh` script located in the project root:

```bash
# Usage: ./setup.sh <PROJECT_ID>
./setup.sh my-gcp-project-id
```

The script performs the following tasks automatically:
1. Provisions infrastructure via Terraform (`iac/`).
2. Builds and pushes the Docker container image to Artifact Registry.
3. Authenticates `kubectl` to the GKE Autopilot cluster.
4. Inject dynamic parameters (Cloud SQL IP, DB password, Artifact Registry image URL) and applies all Kubernetes manifests.
5. Verifies deployment rollout status.

---

## Manifest Overview

| Manifest | Purpose |
| :--- | :--- |
| `namespace.yaml` | Defines the `golden-blog` namespace. |
| `configmap.yaml` | Holds non-sensitive environment variables (Port, DB Host, DB Name, DB User). |
| `secret.yaml.example` | Template for the Cloud SQL database password secret. |
| `deployment.yaml` | Autopilot-compliant deployment spec with security context & resource limits. |
| `service.yaml` | Exposes the blog application via a LoadBalancer service. |
| `network-policy.yaml` | Enforces zero-trust isolation on ingress & egress traffic. |

---

## Manual Deployment Guide

### 1. Build and Push Docker Image to Artifact Registry

First, authenticate Docker with GCP Artifact Registry:
```bash
gcloud auth configure-docker europe-west1-docker.pkg.dev
```

Build the Docker image:
```bash
docker build -t europe-west1-docker.pkg.dev/<PROJECT_ID>/golden-blog-repo/golden-retriever-blog:v1.0.0 ./blog-app
```

Push the Docker image:
```bash
docker push europe-west1-docker.pkg.dev/<PROJECT_ID>/golden-blog-repo/golden-retriever-blog:v1.0.0
```

---

### 2. Connect `kubectl` to GKE Autopilot Cluster

Get cluster credentials:
```bash
gcloud container clusters get-credentials golden-blog-gke-cluster --region europe-west1 --project <PROJECT_ID>
```

---

### 3. Deploy Kubernetes Manifests

Apply namespace and configuration:
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
```

Create secret (replace with password output from `terraform output cloud_sql_db_password`):
```bash
cp k8s/secret.yaml.example k8s/secret.yaml
# Edit k8s/secret.yaml with actual password
kubectl apply -f k8s/secret.yaml
```

Apply deployment, service, and network policy:
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/network-policy.yaml
```

---

### 4. Verify Deployment Status

Check running pods:
```bash
kubectl get pods -n golden-blog
```

Get LoadBalancer external IP:
```bash
kubectl get svc -n golden-blog golden-blog-service
```
