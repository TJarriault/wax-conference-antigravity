output "vpc_name" {
  description = "The name of the VPC network."
  value       = google_compute_network.vpc.name
}

output "subnet_name" {
  description = "The name of the subnetwork."
  value       = google_compute_subnetwork.subnet.name
}

output "gke_cluster_name" {
  description = "The name of the deployed GKE Autopilot cluster."
  value       = google_container_cluster.gke_autopilot.name
}

output "gke_cluster_endpoint" {
  description = "The IP address of the GKE cluster master."
  value       = google_container_cluster.gke_autopilot.endpoint
}

output "artifact_repository_url" {
  description = "The URL of the Artifact Registry Docker repository."
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}"
}

output "cloud_sql_instance_name" {
  description = "The name of the Cloud SQL PostgreSQL instance."
  value       = google_sql_database_instance.db.name
}

output "cloud_sql_private_ip" {
  description = "The private IP address of the Cloud SQL PostgreSQL instance."
  value       = google_sql_database_instance.db.private_ip_address
}

output "cloud_sql_database_name" {
  description = "The database name."
  value       = google_sql_database.database.name
}

output "cloud_sql_db_user" {
  description = "The database user."
  value       = google_sql_user.users.name
}

output "cloud_sql_db_password" {
  description = "The generated database password."
  value       = random_password.db_password.result
  sensitive   = true
}

output "service_account_email" {
  description = "The email of the Google Service Account used by Workload Identity."
  value       = google_service_account.blog_sa.email
}
