# Infrastructure as Code (IaC) - Golden Retriever Blog

This directory contains Terraform manifests to provision a production-grade infrastructure on Google Cloud Platform (GCP) for hosting the **Golden Retriever Blog** application.

## Purpose

The module provisions:
1. **Custom VPC Network & Subnetwork** with secondary IP ranges for GKE Pods and Services, and Private Service Access for Cloud SQL.
2. **GKE Autopilot Cluster** with private node configuration and Workload Identity enabled.
3. **Cloud SQL Instance (PostgreSQL 15)** with private IP connectivity only, automatic backups, encrypted connection (`ENCRYPTED_ONLY`), and query insights.
4. **Artifact Registry Repository** for storing containerized Docker images of the blog.
5. **IAM Service Account & Workload Identity Integration** to securely connect GKE Pods to Cloud SQL without storing static credentials.

---

## Providers

| Provider | Version |
| :--- | :--- |
| `hashicorp/google` | `~> 5.30` |
| `hashicorp/random` | `~> 3.6` |

---

## Inputs

| Name | Description | Type | Default | Required |
| :--- | :--- | :--- | :--- | :---: |
| `project_id` | The GCP Project ID where resources will be deployed | `string` | `"my-gcp-project-id"` | yes |
| `region` | The GCP region for regional resources | `string` | `"europe-west1"` | no |
| `zone` | The primary zone for Cloud SQL and compute resources | `string` | `"europe-west1-b"` | no |
| `cluster_name` | The name of the GKE Autopilot cluster | `string` | `"golden-blog-gke-cluster"` | no |
| `network_name` | The name of the VPC network | `string` | `"golden-blog-vpc"` | no |
| `subnet_name` | The name of the VPC subnetwork | `string` | `"golden-blog-subnet"` | no |
| `subnet_cidr` | The CIDR block for the subnetwork | `string` | `"10.10.0.0/20"` | no |
| `db_instance_name` | The name of the Cloud SQL PostgreSQL instance | `string` | `"golden-blog-db-instance"` | no |
| `db_tier` | The machine tier for Cloud SQL | `string` | `"db-custom-2-7680"` | no |
| `db_name` | The default database name | `string` | `"golden_blog"` | no |
| `db_user` | The database user | `string` | `"blog_user"` | no |
| `artifact_repository_id` | The name of the Artifact Registry repository | `string` | `"golden-blog-repo"` | no |

---

## Outputs

| Name | Description |
| :--- | :--- |
| `vpc_name` | The name of the VPC network. |
| `subnet_name` | The name of the subnetwork. |
| `gke_cluster_name` | The name of the deployed GKE Autopilot cluster. |
| `gke_cluster_endpoint` | The IP address of the GKE cluster master. |
| `artifact_repository_url` | The URL of the Artifact Registry Docker repository. |
| `cloud_sql_instance_name` | The name of the Cloud SQL PostgreSQL instance. |
| `cloud_sql_private_ip` | The private IP address of the Cloud SQL PostgreSQL instance. |
| `cloud_sql_database_name` | The database name. |
| `cloud_sql_db_user` | The database user. |
| `cloud_sql_db_password` | The generated database password (sensitive). |
| `service_account_email` | The email of the Google Service Account used by Workload Identity. |

---

## Resources

- `google_compute_network.vpc`
- `google_compute_subnetwork.subnet`
- `google_compute_global_address.private_ip_address`
- `google_service_networking_connection.private_vpc_connection`
- `google_artifact_registry_repository.repo`
- `google_container_cluster.gke_autopilot`
- `google_sql_database_instance.db`
- `google_sql_database.database`
- `google_sql_user.users`
- `random_password.db_password`
- `google_service_account.blog_sa`
- `google_project_iam_member.cloudsql_client`
- `google_service_account_iam_member.workload_identity_user`

---

## Usage Instructions

1. Copy `terraform.tfvars.example` to `terraform.tfvars` and set your `project_id`:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```
2. Initialize Terraform:
   ```bash
   terraform init
   ```
3. Format and validate:
   ```bash
   terraform fmt
   terraform validate
   ```
4. Apply plan:
   ```bash
   terraform plan
   terraform apply
   ```
