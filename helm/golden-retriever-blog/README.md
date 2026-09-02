# Golden Retriever Blog Helm Chart

Helm Chart for deploying the **Golden Retriever Blog** web application on GKE Autopilot clusters connected to Google Cloud SQL PostgreSQL.

## Prerequisites

- Kubernetes 1.25+
- Helm 3.0+
- Access to GKE Autopilot Cluster

## Installing the Chart

To install the chart with the release name `golden-blog` in namespace `golden-blog`:

```bash
helm install golden-blog ./helm/golden-retriever-blog \
  --namespace golden-blog \
  --create-namespace \
  --set database.host="<CLOUD_SQL_PRIVATE_IP>" \
  --set database.password="<GENERATED_DB_PASSWORD>"
```

## Configurable Parameters

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `replicaCount` | Number of pod replicas | `2` |
| `image.repository` | Docker image repository | `europe-west1-docker.pkg.dev/my-gcp-project-id/golden-blog-repo/golden-retriever-blog` |
| `image.tag` | Docker image tag | `v1.0.0` |
| `service.type` | Kubernetes service type | `LoadBalancer` |
| `service.port` | Service external port | `80` |
| `service.targetPort` | Container target port | `8080` |
| `database.host` | Cloud SQL PostgreSQL private IP | `"10.10.0.5"` |
| `database.port` | Database port | `5432` |
| `database.name` | Database name | `"golden_blog"` |
| `database.user` | Database user | `"blog_user"` |
| `database.password` | Database password | `"REPLACE_WITH_GENERATED_DB_PASSWORD"` |
| `resources.limits.cpu` | CPU limit | `500m` |
| `resources.limits.memory` | Memory limit | `512Mi` |
| `networkPolicy.enabled` | Enable NetworkPolicy | `true` |

## Uninstalling the Chart

To uninstall/delete the `golden-blog` deployment:

```bash
helm uninstall golden-blog --namespace golden-blog
```
