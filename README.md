# Golden Retriever Blog Application

A modern web application celebrating the temperament, care, and heartwarming loyalty of Golden Retrievers, built for demonstration at the WAX Conference.

---

## 1. Project Description

The **Golden Retriever Blog** is a containerized multi-tier web application designed to run on **Google Kubernetes Engine (GKE Autopilot)** or local **Minikube** clusters, with persistence provided by **Google Cloud SQL PostgreSQL** (or an in-memory resilient fallback). It features a responsive user interface with dark mode support, dynamic article listing, and interactive community commenting.

---

## 2. Architecture View

```mermaid
graph TD
    Client["User / Web Browser"] -->|HTTP / Port 80, 8080| Ingress["GKE LoadBalancer Service / Ingress"]
    Ingress -->|TCP / Port 8080| AppPods["Golden Retriever Blog Pods (Node.js/Express)"]
    AppPods -->|Static Assets| Frontend["Frontend UI (Vanilla JS, CSS, HTML5)"]
    AppPods -->|REST API (/api/posts, /api/comments)| Backend["Backend API Logic (server.js)"]
    Backend -->|PostgreSQL Protocol / Port 5432| CloudSQL[("Cloud SQL (PostgreSQL Database)")]
    Backend -.->|Fallback if DB Offline| InMemory[("In-Memory State Store")]
```

---

## 3. Components List

| Component Type | Component Name | Technology Stack | Responsibility & Details |
| :--- | :--- | :--- | :--- |
| **Frontend** | Web UI & Static Client | HTML5, Vanilla CSS (tokens/theming), Vanilla JavaScript | Responsive client interface, light/dark theme toggle, dynamic article feed rendering, and comment submission. |
| **Backend** | Blog API Service | Node.js (v22), Express.js | Exposes REST endpoints (`/api/posts`, `/api/comments`, `/healthz`), handles DB connection pool and fallback data management. |
| **Database** | Persistence Layer | Cloud SQL / PostgreSQL (pg client) | Relational storage for blog articles and community comments. |
| **Infrastructure / Orchestration** | Cluster Deployment | GKE Autopilot / Minikube, Helm 3, Terraform | Declarative manifests, automated pod scaling, security hardening, and zero-trust NetworkPolicy isolation. |

---

## 4. Network Rules & Flow Matrix

### Network Rule Matrix

| From | Destination | Port | Usage |
| :--- | :--- | :--- | :--- |
| Internet / Clients | LoadBalancer Service | 8080 (or 80) | External HTTP traffic accessing the blog interface and API |
| LoadBalancer Service | Blog Pods (`golden-retriever-blog`) | 8080 | Routing ingress traffic to Node.js application containers |
| Blog Pods | Cloud SQL PostgreSQL Instance | 5432 | Database queries for fetching and inserting posts and comments |
| Kubelet / Cluster Probes | Blog Pods (`golden-retriever-blog`) | 8080 | Liveness and Readiness health checks via `/healthz` |
| Blog Pods | Internal DNS (`kube-dns`) | 53 | Resolving Kubernetes service discovery and external endpoints |

### Flow Matrix

| Source | Destination | Protocol | Port | Description / Reason |
| :--- | :--- | :--- | :--- | :--- |
| Web Browser / Client | `golden-blog-service` | TCP (HTTP) | 8080 | Client requests to access web pages and REST endpoints |
| `golden-blog-service` | `golden-retriever-blog` pods | TCP (HTTP) | 8080 | Service endpoint distribution across pod replicas |
| `golden-retriever-blog` pods | Cloud SQL Instance | TCP (PostgreSQL) | 5432 | Querying posts and persisting reader comments |
| Cluster Kubelet | `golden-retriever-blog` pods | TCP (HTTP) | 8080 | Continuous health verification against `/healthz` |
| `golden-retriever-blog` pods | `kube-dns` | UDP / TCP | 53 | CoreDNS lookups for database host and service resolution |

---

## 5. Security & Hardening (Shift-Left Security)

- **Non-Root Execution:** Containers run as an unprivileged user (`UID 10001`, `GID 10001`).
- **Read-Only Root Filesystem:** Root filesystem is mounted read-only to prevent unauthorized binary modification.
- **Capabilities Dropped:** All Linux capabilities dropped (`drop: ["ALL"]`).
- **Privilege Escalation Disabled:** `allowPrivilegeEscalation: false`.
- **Zero-Trust NetworkPolicy:** Ingress and egress restricted via dedicated NetworkPolicies.
- **Input Sanitization & Parameterized Queries:** Database queries use parameter bindings (`$1, $2, ...`) to prevent SQL injection.

---

## 6. Testing & Deployment Verification

For local testing guidelines, docker image creation, and Minikube Helm verification steps, consult [TEST.md](file:///appli/Sogeti/wax-conference/wax-conference-antigravity/TEST.md).
