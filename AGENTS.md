# AGENTS.md

## Project

This repository contains Infrastructure as Code and Kubernetes
configuration.

## Rules

- Never commit secrets.
- Never modify production resources without explicit justification.
- Follow existing Terraform module conventions.
- Use terraform fmt.
- Use terraform validate.
- Run security checks when available.
- Do not introduce breaking changes without documentation.

## Terraform

Before proposing changes:

1. Run terraform fmt.
2. Run terraform validate.
3. Check for security issues.
4. Document significant infrastructure changes.

## Kubernetes

Before proposing changes:

1. Validate manifests.
2. Check resource limits.
3. Check securityContext.
4. Check NetworkPolicies when applicable.
5. Avoid privileged containers.
6. Create helm file allowing to deploy easly application

## Pull Requests

Changes must:

- Be minimal.
- Include tests where appropriate.
- Not introduce secrets.
- Respect the existing architecture.
