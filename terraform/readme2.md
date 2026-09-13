# GCP Terraform Deployment Using a Service Account Key

This guide deploys the Wealth Management Platform infrastructure to Google Cloud with modular Terraform, separate `dev` and `prod` root modules, a GCS remote backend, and GitHub Actions.

> **Important:** This guide uses a JSON service account key because your sandbox permits it. A key is a long-lived credential. Never paste it into Terraform code, commit it to Git, print it in logs, or upload it as a normal repository file. For a long-term production design, replace it with Workload Identity Federation.

## 1. Variables to set

Run these commands in the shell where `gcloud` is installed:

```bash
export PROJECT_ID="YOUR_GCP_PROJECT_ID"
export PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
export REGION="us-central1"
export ZONE="us-central1-a"
export TF_SERVICE_ACCOUNT_NAME="wmp-terraform"
export TF_SERVICE_ACCOUNT_EMAIL="${TF_SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
export TF_KEY_FILE="$HOME/wmp-terraform-key.json"

gcloud config set project "$PROJECT_ID"
gcloud config set compute/region "$REGION"
gcloud config set compute/zone "$ZONE"
```

Confirm the values:

```bash
printf 'PROJECT_ID=%s\nPROJECT_NUMBER=%s\nREGION=%s\nSERVICE_ACCOUNT=%s\n' \
  "$PROJECT_ID" "$PROJECT_NUMBER" "$REGION" "$TF_SERVICE_ACCOUNT_EMAIL"
```

## 2. Discover your granular permissions first

Do not assume that the sandbox lets you create service accounts, grant IAM roles, enable APIs, create GCS buckets, or create GKE clusters.

```bash
gcloud auth list
gcloud config list
gcloud projects get-iam-policy "$PROJECT_ID" \
  --flatten="bindings[].members" \
  --filter="bindings.members:$(gcloud config get-value account)" \
  --format="table(bindings.role)"
```

Test the relevant resource visibility:

```bash
gcloud services list --enabled --project "$PROJECT_ID"
gcloud compute networks list --project "$PROJECT_ID"
gcloud container clusters list --project "$PROJECT_ID" --region "$REGION"
gcloud artifacts repositories list --project "$PROJECT_ID" --location "$REGION"
gcloud iam service-accounts list --project "$PROJECT_ID"
gcloud storage buckets list --project "$PROJECT_ID"
```

If an IAM command fails with `PERMISSION_DENIED`, record the exact missing permission. Do not replace granular access with Owner merely to bypass the error.

## 3. Enable required APIs

This requires `serviceusage.services.enable`. If it is denied, ask the sandbox administrator to enable the APIs.

```bash
gcloud services enable \
  compute.googleapis.com \
  container.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com \
  cloudresourcemanager.googleapis.com \
  storage.googleapis.com \
  serviceusage.googleapis.com \
  --project "$PROJECT_ID"
```

Verify:

```bash
gcloud services list --enabled --project "$PROJECT_ID" \
  --filter="config.name:(compute.googleapis.com container.googleapis.com artifactregistry.googleapis.com iam.googleapis.com storage.googleapis.com)" \
  --format="table(config.name)"
```

## 4. Create or identify the Terraform service account

### Option A: Create it yourself

```bash
gcloud iam service-accounts create "$TF_SERVICE_ACCOUNT_NAME" \
  --project "$PROJECT_ID" \
  --display-name="WMP Terraform automation"
```

### Option B: Use a sandbox-provided account

If creation is denied, list existing accounts and select the one assigned to you:

```bash
gcloud iam service-accounts list \
  --project "$PROJECT_ID" \
  --format="table(email,displayName,disabled)"
```

Then reset the variable:

```bash
export TF_SERVICE_ACCOUNT_EMAIL="PROVIDED_ACCOUNT@${PROJECT_ID}.iam.gserviceaccount.com"
```

## 5. Grant least-privilege project roles

Only a principal with permission to change project IAM can run these commands. In a managed sandbox, the administrator may already have assigned the roles.

The initial lab needs these roles:

- `roles/compute.networkAdmin` for VPCs, subnets, routers, NAT, and firewall rules.
- `roles/container.admin` for GKE control-plane and cluster resources.
- `roles/artifactregistry.admin` for Artifact Registry repositories.
- `roles/storage.admin` for the Terraform state buckets. After bootstrap, reduce this to bucket-scoped access where possible.
- `roles/iam.serviceAccountUser` so Terraform can attach permitted runtime service accounts to GKE resources.
- `roles/serviceusage.serviceUsageConsumer` to consume enabled project services.

Grant them only if your account is authorized:

```bash
for ROLE in \
  roles/compute.networkAdmin \
  roles/container.admin \
  roles/artifactregistry.admin \
  roles/storage.admin \
  roles/iam.serviceAccountUser \
  roles/serviceusage.serviceUsageConsumer
do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${TF_SERVICE_ACCOUNT_EMAIL}" \
    --role="$ROLE" \
    --condition=None
done
```

Verify the account's roles:

```bash
gcloud projects get-iam-policy "$PROJECT_ID" \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:${TF_SERVICE_ACCOUNT_EMAIL}" \
  --format="table(bindings.role)"
```

> Depending on the exact GKE configuration, Google Cloud may report an additional missing permission during `terraform plan` or `apply`. Add only the role containing that permission, then retry. This is the granular-permission workflow used in controlled environments.

## 6. Create the JSON service account key

The key must be generated by Google Cloud. No one should manually invent or edit its JSON fields.

```bash
umask 077
gcloud iam service-accounts keys create "$TF_KEY_FILE" \
  --iam-account="$TF_SERVICE_ACCOUNT_EMAIL" \
  --project="$PROJECT_ID"
chmod 600 "$TF_KEY_FILE"
```

Validate without exposing the private key:

```bash
python3 - <<'PY'
import json
from pathlib import Path
p = Path.home() / "wmp-terraform-key.json"
d = json.loads(p.read_text())
print("type:", d.get("type"))
print("project_id:", d.get("project_id"))
print("client_email:", d.get("client_email"))
print("private_key_id present:", bool(d.get("private_key_id")))
PY
```

Authenticate locally through Application Default Credentials:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$TF_KEY_FILE"
gcloud auth activate-service-account "$TF_SERVICE_ACCOUNT_EMAIL" \
  --key-file="$GOOGLE_APPLICATION_CREDENTIALS" \
  --project="$PROJECT_ID"
gcloud auth list
gcloud auth print-access-token >/dev/null && echo "Authentication works"
```

## 7. Protect credentials from Git

Add the following to the repository root `.gitignore`:

```gitignore
# Google credentials
*.json
gha-creds-*.json

# Terraform local files
**/.terraform/*
*.tfstate
*.tfstate.*
crash.log
crash.*.log
*.tfplan
.terraform.lock.hcl
```

If the key was ever committed, deleting the file is insufficient. Disable/delete that key immediately and create a new one.

Check before every push:

```bash
git status --short
git ls-files '*.json'
git grep -n 'private_key' || true
```

## 8. Create remote-state buckets

Use separate state buckets for stronger dev/prod isolation. Bucket names are globally unique, so include the project ID.

```bash
export DEV_STATE_BUCKET="${PROJECT_ID}-wmp-tfstate-dev"
export PROD_STATE_BUCKET="${PROJECT_ID}-wmp-tfstate-prod"

gcloud storage buckets create "gs://${DEV_STATE_BUCKET}" \
  --project="$PROJECT_ID" \
  --location="$REGION" \
  --uniform-bucket-level-access

gcloud storage buckets create "gs://${PROD_STATE_BUCKET}" \
  --project="$PROJECT_ID" \
  --location="$REGION" \
  --uniform-bucket-level-access

gcloud storage buckets update "gs://${DEV_STATE_BUCKET}" --versioning
gcloud storage buckets update "gs://${PROD_STATE_BUCKET}" --versioning
```

Verify:

```bash
gcloud storage buckets describe "gs://${DEV_STATE_BUCKET}"
gcloud storage buckets describe "gs://${PROD_STATE_BUCKET}"
```

## 9. Expected Terraform repository structure

```text
wealth-project-gcp/
├── .github/
│   └── workflows/
│       ├── terraform-plan.yml
│       └── terraform-apply.yml
├── envs/
│   ├── dev/
│   │   ├── backend.tf
│   │   ├── main.tf
│   │   ├── outputs.tf
│   │   ├── providers.tf
│   │   ├── terraform.tfvars
│   │   └── variables.tf
│   └── prod/
│       ├── backend.tf
│       ├── main.tf
│       ├── outputs.tf
│       ├── providers.tf
│       ├── terraform.tfvars
│       └── variables.tf
└── modules/
    ├── artifact-registry/
    ├── gke/
    ├── network/
    └── service-accounts/
```

Each environment is an independent Terraform root module with independent state. Shared reusable code stays in `modules/`.

## 10. Backend configuration

Use an empty backend block so the bucket can be supplied during initialization.

`envs/dev/backend.tf` and `envs/prod/backend.tf`:

```hcl
terraform {
  backend "gcs" {}
}
```

Recommended provider configuration in both environments:

```hcl
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
```

## 11. Local Terraform execution for dev

Run formatting across the repository:

```bash
terraform fmt -recursive -check
```

Initialize dev with its own GCS backend:

```bash
cd envs/dev
terraform init \
  -backend-config="bucket=${DEV_STATE_BUCKET}" \
  -backend-config="prefix=wealth-platform/dev"
```

Validate and inspect provider access:

```bash
terraform validate
terraform providers
```

Create and review a saved plan:

```bash
terraform plan \
  -var="project_id=${PROJECT_ID}" \
  -var="region=${REGION}" \
  -out=dev.tfplan

terraform show dev.tfplan
```

Apply exactly the reviewed plan:

```bash
terraform apply dev.tfplan
```

Inspect outputs and state:

```bash
terraform output
terraform state list
```

Check resources with `gcloud`:

```bash
gcloud compute networks list --project "$PROJECT_ID"
gcloud compute networks subnets list --project "$PROJECT_ID" --regions "$REGION"
gcloud artifacts repositories list --project "$PROJECT_ID" --location "$REGION"
gcloud container clusters list --project "$PROJECT_ID" --region "$REGION"
```

## 12. Local Terraform execution for prod

Do not deploy prod merely because dev succeeded. Review the prod variable file, quotas, CIDR ranges, region, cluster size, and sandbox lifetime first.

```bash
cd ../../envs/prod
terraform init \
  -backend-config="bucket=${PROD_STATE_BUCKET}" \
  -backend-config="prefix=wealth-platform/prod"

terraform validate
terraform plan \
  -var="project_id=${PROJECT_ID}" \
  -var="region=${REGION}" \
  -out=prod.tfplan
terraform show prod.tfplan
terraform apply prod.tfplan
```

For a one-day sandbox, it is reasonable to fully deploy `dev` and only run `terraform plan` for `prod` unless you have enough quota and time.

## 13. Add the key to GitHub securely

In the GitHub repository:

1. Open **Settings**.
2. Open **Secrets and variables**.
3. Open **Actions**.
4. Create repository secret `GCP_CREDENTIALS`.
5. Paste the complete JSON content of `$HOME/wmp-terraform-key.json` as the secret value.
6. Create repository variable `GCP_PROJECT_ID`.
7. Create repository variable `GCP_REGION`, for example `us-central1`.
8. Create variables `TF_STATE_BUCKET_DEV` and `TF_STATE_BUCKET_PROD`.

To copy the key locally, use a method that does not print it into recorded terminal logs. Never put the JSON in workflow YAML.

For production approvals, create GitHub Environments named `dev` and `prod`, then configure required reviewers for `prod`.

## 14. GitHub Actions plan workflow

Create `.github/workflows/terraform-plan.yml`:

```yaml
name: Terraform Plan

on:
  pull_request:
    paths:
      - "modules/**"
      - "envs/**"
      - ".github/workflows/terraform-*.yml"
  workflow_dispatch:
    inputs:
      environment:
        description: Environment to plan
        required: true
        type: choice
        options:
          - dev
          - prod
        default: dev

permissions:
  contents: read

jobs:
  plan:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'dev' }}
    env:
      TF_IN_AUTOMATION: "true"
      TF_INPUT: "false"
      TF_ENV: ${{ github.event.inputs.environment || 'dev' }}
      TF_VAR_project_id: ${{ vars.GCP_PROJECT_ID }}
      TF_VAR_region: ${{ vars.GCP_REGION }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v3
        with:
          credentials_json: ${{ secrets.GCP_CREDENTIALS }}

      - name: Set up Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Select backend bucket
        shell: bash
        run: |
          if [[ "$TF_ENV" == "prod" ]]; then
            echo "TF_STATE_BUCKET=${{ vars.TF_STATE_BUCKET_PROD }}" >> "$GITHUB_ENV"
          else
            echo "TF_STATE_BUCKET=${{ vars.TF_STATE_BUCKET_DEV }}" >> "$GITHUB_ENV"
          fi

      - name: Terraform format check
        run: terraform fmt -check -recursive

      - name: Terraform init
        working-directory: envs/${{ env.TF_ENV }}
        run: |
          terraform init \
            -backend-config="bucket=${TF_STATE_BUCKET}" \
            -backend-config="prefix=wealth-platform/${TF_ENV}"

      - name: Terraform validate
        working-directory: envs/${{ env.TF_ENV }}
        run: terraform validate

      - name: Terraform plan
        working-directory: envs/${{ env.TF_ENV }}
        run: terraform plan -no-color -out=tfplan
```

## 15. GitHub Actions apply workflow

Create `.github/workflows/terraform-apply.yml`:

```yaml
name: Terraform Apply

on:
  workflow_dispatch:
    inputs:
      environment:
        description: Environment to deploy
        required: true
        type: choice
        options:
          - dev
          - prod
        default: dev

permissions:
  contents: read

concurrency:
  group: terraform-${{ inputs.environment }}
  cancel-in-progress: false

jobs:
  apply:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    env:
      TF_IN_AUTOMATION: "true"
      TF_INPUT: "false"
      TF_ENV: ${{ inputs.environment }}
      TF_VAR_project_id: ${{ vars.GCP_PROJECT_ID }}
      TF_VAR_region: ${{ vars.GCP_REGION }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v3
        with:
          credentials_json: ${{ secrets.GCP_CREDENTIALS }}

      - name: Set up Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Select backend bucket
        shell: bash
        run: |
          if [[ "$TF_ENV" == "prod" ]]; then
            echo "TF_STATE_BUCKET=${{ vars.TF_STATE_BUCKET_PROD }}" >> "$GITHUB_ENV"
          else
            echo "TF_STATE_BUCKET=${{ vars.TF_STATE_BUCKET_DEV }}" >> "$GITHUB_ENV"
          fi

      - name: Terraform init
        working-directory: envs/${{ env.TF_ENV }}
        run: |
          terraform init \
            -backend-config="bucket=${TF_STATE_BUCKET}" \
            -backend-config="prefix=wealth-platform/${TF_ENV}"

      - name: Terraform validate
        working-directory: envs/${{ env.TF_ENV }}
        run: terraform validate

      - name: Terraform plan
        working-directory: envs/${{ env.TF_ENV }}
        run: terraform plan -out=tfplan

      - name: Terraform apply
        working-directory: envs/${{ env.TF_ENV }}
        run: terraform apply -auto-approve tfplan
```

> For a stronger production pipeline, upload the reviewed plan artifact in the plan job and apply that exact artifact after approval. The above workflow is suitable for a time-limited learning sandbox, but the GitHub `prod` environment should still require a reviewer.

## 16. First deployment sequence for the one-day sandbox

Follow this order to preserve time and isolate permission failures:

```text
1. Authentication and IAM discovery
2. Enable APIs
3. Create/select service account
4. Create JSON key and verify authentication
5. Create dev state bucket
6. terraform fmt and validate
7. Dev network module plan/apply
8. Artifact Registry module plan/apply
9. GKE module plan
10. Check quota and permission errors
11. GKE apply only if quota and time permit
12. Validate resources
13. GitHub Actions plan
14. GitHub Actions dev apply
15. Prod plan only
16. Destroy chargeable sandbox resources
17. Delete the service account key
```

When iterating, temporarily comment out the GKE module if the cluster is blocked. This lets you complete VPC and Artifact Registry without losing the whole lab.

## 17. Troubleshooting

### `PERMISSION_DENIED`

Capture the exact permission and resource:

```bash
terraform plan -no-color 2>&1 | tee terraform-plan-error.log
grep -Ei 'permission|denied|forbidden' terraform-plan-error.log
```

Then inspect current service-account roles:

```bash
gcloud projects get-iam-policy "$PROJECT_ID" \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:${TF_SERVICE_ACCOUNT_EMAIL}" \
  --format="table(bindings.role)"
```

### API is disabled

```bash
gcloud services list --enabled --project "$PROJECT_ID"
gcloud services enable SERVICE_NAME --project "$PROJECT_ID"
```

### Backend bucket access failure

```bash
gcloud storage ls "gs://${DEV_STATE_BUCKET}"
gcloud storage buckets get-iam-policy "gs://${DEV_STATE_BUCKET}"
```

### Terraform is using the wrong identity

```bash
echo "$GOOGLE_APPLICATION_CREDENTIALS"
gcloud auth list
terraform providers
```

### GKE quota failure

```bash
gcloud compute project-info describe --project "$PROJECT_ID"
gcloud container clusters list --project "$PROJECT_ID" --region "$REGION"
```

Use a small regional or zonal learning configuration only after checking the sandbox's quota and permitted locations.

## 18. Cleanup before the sandbox expires

Destroy prod first if it was applied, then dev:

```bash
cd envs/prod
terraform plan -destroy \
  -var="project_id=${PROJECT_ID}" \
  -var="region=${REGION}" \
  -out=destroy.tfplan
terraform apply destroy.tfplan

cd ../dev
terraform plan -destroy \
  -var="project_id=${PROJECT_ID}" \
  -var="region=${REGION}" \
  -out=destroy.tfplan
terraform apply destroy.tfplan
```

Confirm that chargeable resources are gone:

```bash
gcloud container clusters list --project "$PROJECT_ID" --region "$REGION"
gcloud compute instances list --project "$PROJECT_ID"
gcloud compute forwarding-rules list --project "$PROJECT_ID"
gcloud compute addresses list --project "$PROJECT_ID"
```

Delete the remote state buckets only after successful Terraform destruction and only if you no longer need the state history:

```bash
gcloud storage rm --recursive "gs://${DEV_STATE_BUCKET}"
gcloud storage rm --recursive "gs://${PROD_STATE_BUCKET}"
```

## 19. Revoke and delete the service account key

List keys:

```bash
gcloud iam service-accounts keys list \
  --iam-account="$TF_SERVICE_ACCOUNT_EMAIL" \
  --project="$PROJECT_ID"
```

Delete the key in Google Cloud using its key ID:

```bash
gcloud iam service-accounts keys delete KEY_ID \
  --iam-account="$TF_SERVICE_ACCOUNT_EMAIL" \
  --project="$PROJECT_ID"
```

Delete the local file securely:

```bash
rm -f "$TF_KEY_FILE"
unset GOOGLE_APPLICATION_CREDENTIALS
```

Also remove or replace the `GCP_CREDENTIALS` GitHub secret. For the next long-lived implementation, migrate GitHub Actions to Workload Identity Federation so no JSON private key is stored.

## 20. Official references

- Google Cloud, **Authentication for Terraform**: https://docs.cloud.google.com/docs/terraform/authentication
- Google GitHub Action, **Authenticate to Google Cloud**: https://github.com/google-github-actions/auth
