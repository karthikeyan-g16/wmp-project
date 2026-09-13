# wmp-project
wealth managment app
# Wealth Management Platform - GCP Infrastructure as Code

This repository contains Terraform code for deploying the Wealth Management Platform onto Google Cloud Platform (GCP).

## Architecture

```text
GitHub
   |
   v
GitHub Actions
   |
Terraform
   |
   +-- Network Module
   |      |
   |      +-- VPC
   |      +-- Subnets
   |      +-- Firewall Rules
   |
   +-- Artifact Registry Module
   |
   +-- GKE Module
   |
   +-- Cloud SQL Module
```

---

## Folder Structure

```text
wealth-project-gcp/
│
├── envs/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   │
│   └── prod/
│       ├── main.tf
│       ├── variables.tf
│       ├── terraform.tfvars
│       └── backend.tf
│
├── modules/
│   ├── network/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   ├── artifact-registry/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   ├── gke/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   └── cloudsql/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
└── .github/
    └── workflows/
        ├── terraform-plan.yml
        └── terraform-apply.yml
```

---
