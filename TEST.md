# Local Testing & Availability Validation Guide

This document describes the instructions and procedures to build, deploy, and validate the **Golden Retriever Blog** application locally on Minikube.

---

## 1. Docker Image Creation & Local Build

After making application code changes (such as updating article content or titles in `blog-app/server.js`), build the container image targeting the local Docker / Minikube environment:

```bash
# Build the local container image
docker build -t golden-retriever-blog:local ./blog-app
```

### Verification
Verify that the image is successfully built and registered:
```bash
docker images | grep golden-retriever-blog
```

---

## 2. Helm Integration & Deployment on Minikube

Deploy or upgrade the Helm release onto the local Minikube cluster in the `golden-blog` namespace:

```bash
# Ensure namespace exists
kubectl create namespace golden-blog --dry-run=client -o yaml | kubectl apply -f -

# Install or upgrade chart using local image
helm upgrade --install golden-blog ./helm/golden-retriever-blog \
  --namespace golden-blog \
  --set image.repository=golden-retriever-blog \
  --set image.tag=local \
  --set image.pullPolicy=Never
```

If the chart is already deployed and you have rebuilt the image with the same tag, perform a rollout restart:
```bash
kubectl rollout restart deployment golden-blog-golden-retriever-blog -n golden-blog
kubectl rollout status deployment golden-blog-golden-retriever-blog -n golden-blog --timeout=60s
```

---

## 3. Application Health & Functionality Tests

### 3.1 Check Pod Status
Ensure all replicas are in `Running` and `Ready` state:
```bash
kubectl get pods -n golden-blog
```

### 3.2 Liveness & Readiness Probe Validation
Verify that `/healthz` returns `status: "ok"`:
```bash
kubectl exec -n golden-blog deploy/golden-blog-golden-retriever-blog -- node -e '
const http = require("http");
http.get("http://localhost:8080/healthz", res => {
  let d = "";
  res.on("data", c => d += c);
  res.on("end", () => console.log("Health check:", d));
});'
```

### 3.3 Validate Article Endpoint & Updated Title
Verify that `/api/posts` serves the updated article title:
```bash
kubectl exec -n golden-blog deploy/golden-blog-golden-retriever-blog -- node -e '
const http = require("http");
http.get("http://localhost:8080/api/posts", res => {
  let d = "";
  res.on("data", c => d += c);
  res.on("end", () => {
    const posts = JSON.parse(d);
    console.log("Post 1 Title:", posts[0].title);
  });
});'
```

Expected output:
```
Post 1 Title: Why My Golden Retrievers named 'Cooper' is Known as the Kindest Dogs
```
