## 2025-05-24 - SQL Injection Vulnerability Found
**Vulnerability:** SQL Injection in comments fetching endpoint (`/api/comments`). Wait, checking... Oh, I should verify the code first.

## 2025-05-24 - Hardcoded Database Credentials Removed
**Vulnerability:** A database password was hardcoded into `blog-app/server.js` (`secretpassword`) as a fallback if the environment variable `DB_PASS` was not provided. Hardcoding credentials in source code creates a severe risk of unauthorized database access if the source code is exposed.
**Learning:** Hardcoded credentials are often introduced as "conveniences" for local development but make their way into production code, bypassing the secrets management design (e.g. Terraform `random_password` and Kubernetes Secrets mentioned in `ARCHITECTURE.md`).
**Prevention:** Remove hardcoded secrets and rely strictly on environment variables or secrets managers. Fallback mechanisms should not supply default production credentials.
