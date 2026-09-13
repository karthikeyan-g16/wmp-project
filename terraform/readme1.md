# GitHub Actions to GCP using Workload Identity Federation (No Service Account Key)

## Why Use Workload Identity Federation?

Traditionally GitHub Actions authenticates to GCP using a Service Account Key JSON file.

Problems:

- Long-lived credentials
- Secret rotation required
- Key leakage risk
- Not recommended by Google

Workload Identity Federation (WIF) allows GitHub Actions to obtain short-lived credentials directly from Google Cloud without storing a service account key.

Architecture:

```text
GitHub Actions
      |
      | OIDC Token
      v
Workload Identity Pool
      |
      v
Workload Identity Provider
      |
      v
GCP Service Account
      |
      v
Terraform
      |
      v
GCP Resources
```

---

# Prerequisites

Required APIs:

```bash
gcloud services enable iam.googleapis.com
gcloud services enable iamcredentials.googleapis.com
gcloud services enable sts.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
```

Verify:

```bash
gcloud services list --enabled
```

---

# Step 1: Define Variables

```bash
export PROJECT_ID=<YOUR_PROJECT_ID>

export PROJECT_NUMBER=$(gcloud projects describe \
${PROJECT_ID} \
--format="value(projectNumber)")
```

Verify:

```bash
echo $PROJECT_NUMBER
```

---

# Step 2: Create Github Terraform Service Account

```bash
gcloud iam service-accounts create github-terraform \
    --display-name="GitHub Terraform Service Account"
```

Verify:

```bash
gcloud iam service-accounts list
```

Expected:

```text
github-terraform@PROJECT_ID.iam.gserviceaccount.com
```

---

# Step 3: Grant Terraform Permissions

Minimum for learning:

```bash
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:github-terraform@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/editor"
```

Recommended Production Roles:

```text
roles/compute.admin
roles/container.admin
roles/artifactregistry.admin
roles/iam.serviceAccountUser
roles/storage.admin
```

Example:

```bash
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
 --member="serviceAccount:github-terraform@${PROJECT_ID}.iam.gserviceaccount.com" \
 --role="roles/compute.admin"
```

---

# Step 4: Create Workload Identity Pool

```bash
gcloud iam workload-identity-pools create github-pool \
    --location="global" \
    --display-name="GitHub Pool"
```

Verify:

```bash
gcloud iam workload-identity-pools list \
    --location="global"
```

---

# Step 5: Create GitHub Provider

Replace:

```text
YOUR_GITHUB_USERNAME
YOUR_REPO
```

Create provider:

```bash
gcloud iam workload-identity-pools providers create-oidc github-provider \
    --location="global" \
    --workload-identity-pool="github-pool" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository"

gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository=='karthikeyan-g16/wmp-project'"
  
```

Verify:

```bash
gcloud iam workload-identity-pools providers list \
    --location="global" \
    --workload-identity-pool="github-pool"
```

---

# Step 6: Obtain Pool Name

```bash
gcloud iam workload-identity-pools describe github-pool \
   --location=global
```

Example:

```text
projects/123456789/locations/global/workloadIdentityPools/github-pool
```

Store:

```bash
export WORKLOAD_IDENTITY_POOL_ID="github-pool"
```

---

# Step 7: Allow GitHub Repository Access

Replace:

```text
YOUR_GITHUB_USERNAME
wealth-project-gcp
```

Grant permission:

```bash
gcloud iam service-accounts add-iam-policy-binding \
 github-terraform@${PROJECT_ID}.iam.gserviceaccount.com \
 --role=roles/iam.workloadIdentityUser \
 --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository/YOUR_GITHUB_USERNAME/wealth-project-gcp"

 gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository=='karthikeyan-g16/wmp-project'"
```

Verify:

```bash
gcloud iam service-accounts get-iam-policy \
github-terraform@${PROJECT_ID}.iam.gserviceaccount.com
```

---

# Step 8: GitHub Secrets

GitHub Repository

Settings

Secrets and Variables

Actions

Create:

```text
GCP_PROJECT_ID
WORKLOAD_IDENTITY_PROVIDER
GCP_SERVICE_ACCOUNT
```

Values:

## GCP_PROJECT_ID

```text
my-project-id
```

## GCP_SERVICE_ACCOUNT

```text
github-terraform@my-project-id.iam.gserviceaccount.com
```

## WORKLOAD_IDENTITY_PROVIDER

Format:

```text
projects/123456789/locations/global/workloadIdentityPools/github-pool/providers/github-provider
```

Get it:

```bash
gcloud iam workload-identity-pools providers describe \
github-provider \
--location=global \
--workload-identity-pool=github-pool
```

---

# Terraform Repository Structure

```text
wealth-project-gcp/

├── envs
│   ├── dev
│   └── prod
│
├── modules
│   ├── network
│   ├── artifact-registry
│   └── gke
│
└── .github
    └── workflows
```

---

# Terraform Plan Workflow

File:

```text
.github/workflows/terraform-plan.yml
```

```yaml
name: Terraform Plan

on:
  pull_request:
  workflow_dispatch:

permissions:
  id-token: write
  contents: read

jobs:
  terraform-plan:

    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: envs/dev

    steps:

      - name: Checkout
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Terraform Init
        run: terraform init

      - name: Terraform Validate
        run: terraform validate

      - name: Terraform Format Check
        run: terraform fmt -check

      - name: Terraform Plan
        run: terraform plan
```

---

# Terraform Apply Workflow

File:

```text
.github/workflows/terraform-apply.yml
```

```yaml
name: Terraform Apply

on:
  push:
    branches:
      - main

permissions:
  id-token: write
  contents: read

jobs:
  terraform-apply:

    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: envs/dev

    steps:

      - name: Checkout
        uses: actions/checkout@v4

      - name: Authenticate
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Terraform Init
        run: terraform init

      - name: Terraform Apply
        run: terraform apply -auto-approve
```

---

# Multi Environment Strategy

```text
main branch
     |
     +--> dev

release branch
     |
     +--> prod
```

Directory:

```text
envs/dev
envs/prod
```

Example:

```yaml
strategy:
  matrix:
    environment:
      - dev
      - prod
```

---

# Recommended Branch Flow

```text
feature/*
      |
      v
pull request
      |
      v
terraform plan
      |
      v
main
      |
      v
terraform apply dev
      |
      v
release
      |
      v
terraform apply prod
```

---

# Future Improvements

Add later:

```text
GCS Remote State
Artifact Registry
Cloud SQL
GKE
Ingress
Managed SSL
Secret Manager
Monitoring
Autoscaling
```

---

# Interview Explanation

If asked:

"How does GitHub Actions authenticate to GCP?"

Answer:

```text
We use Workload Identity Federation.

GitHub Actions generates an OIDC token.

The token is exchanged through a Workload Identity Pool and Provider.

Google validates the token and impersonates a dedicated Terraform Service Account.

No JSON service-account keys are stored in GitHub.

Terraform uses short-lived credentials to deploy infrastructure securely.
```

This is the modern enterprise approach used by many organizations for secure CI/CD into GCP.