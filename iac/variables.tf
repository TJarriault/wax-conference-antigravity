variable "project_id" {
  type        = string
  description = "The GCP Project ID where resources will be deployed."
  default     = "my-gcp-project-id"
}

variable "region" {
  type        = string
  description = "The GCP region for regional resources."
  default     = "europe-west1"
}

variable "zone" {
  type        = string
  description = "The primary zone for Cloud SQL and compute resources."
  default     = "europe-west1-b"
}

variable "cluster_name" {
  type        = string
  description = "The name of the GKE Autopilot cluster."
  default     = "golden-blog-gke-cluster"
}

variable "network_name" {
  type        = string
  description = "The name of the VPC network."
  default     = "golden-blog-vpc"
}

variable "subnet_name" {
  type        = string
  description = "The name of the VPC subnetwork."
  default     = "golden-blog-subnet"
}

variable "subnet_cidr" {
  type        = string
  description = "The CIDR block for the subnetwork."
  default     = "10.10.0.0/20"
}

variable "db_instance_name" {
  type        = string
  description = "The name of the Cloud SQL PostgreSQL instance."
  default     = "golden-blog-db-instance"
}

variable "db_tier" {
  type        = string
  description = "The machine tier for Cloud SQL."
  default     = "db-custom-2-7680" # Standard custom tier, or db-f1-micro for dev
}

variable "db_name" {
  type        = string
  description = "The default database name."
  default     = "golden_blog"
}

variable "db_user" {
  type        = string
  description = "The database user."
  default     = "blog_user"
}

variable "artifact_repository_id" {
  type        = string
  description = "The name of the Artifact Registry repository."
  default     = "golden-blog-repo"
}
