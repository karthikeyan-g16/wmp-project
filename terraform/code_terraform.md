

# Module 1: Network

## modules/network/variables.tf

```hcl
variable "project_id" {}
variable "region" {}
variable "vpc_name" {}
variable "subnet_name" {}
variable "subnet_cidr" {}
```

## modules/network/main.tf

```hcl
resource "google_compute_network" "vpc" {
  name                    = var.vpc_name
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = var.subnet_name
  ip_cidr_range = var.subnet_cidr
  region        = var.region
  network       = google_compute_network.vpc.id
}

resource "google_compute_firewall" "allow_internal" {
  name    = "${var.vpc_name}-internal"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
  }

  source_ranges = [
    "10.0.0.0/8"
  ]
}
```

## modules/network/outputs.tf

```hcl
output "network_name" {
  value = google_compute_network.vpc.name
}

output "subnet_name" {
  value = google_compute_subnetwork.subnet.name
}
```

---

# Module 2: Artifact Registry

## modules/artifact-registry/variables.tf

```hcl
variable "project_id" {}
variable "region" {}
variable "repository_name" {}
```

## modules/artifact-registry/main.tf

```hcl
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = var.repository_name

  format = "DOCKER"
}
```

## modules/artifact-registry/outputs.tf

```hcl
output "repository_id" {
  value = google_artifact_registry_repository.repo.id
}
```

---

# Module 3: GKE

## modules/gke/variables.tf

```hcl
variable "project_id" {}
variable "region" {}
variable "cluster_name" {}
variable "network" {}
variable "subnetwork" {}
```

## modules/gke/main.tf

```hcl
resource "google_container_cluster" "cluster" {
  name     = var.cluster_name
  location = var.region

  remove_default_node_pool = true
  initial_node_count       = 1

  network    = var.network
  subnetwork = var.subnetwork
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "primary-pool"
  cluster    = google_container_cluster.cluster.name
  location   = var.region
  node_count = 1

  node_config {
    machine_type = "e2-medium"
  }
}
```

## modules/gke/outputs.tf

```hcl
output "cluster_name" {
  value = google_container_cluster.cluster.name
}
```

---

# Development Environment

## envs/dev/main.tf

```hcl
terraform {
  required_version = ">= 1.6.0"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

module "network" {
  source = "../../modules/network"

  project_id = var.project_id
  region      = var.region

  vpc_name    = "dev-vpc"
  subnet_name = "dev-subnet"

  subnet_cidr = "10.10.1.0/24"
}

module "artifact_registry" {
  source = "../../modules/artifact-registry"

  project_id = var.project_id
  region = var.region

  repository_name = "wealth-images"
}

module "gke" {
  source = "../../modules/gke"

  project_id = var.project_id
  region = var.region

  cluster_name = "wealth-gke-dev"

  network   = module.network.network_name
  subnetwork = module.network.subnet_name
}
```

## envs/dev/variables.tf

```hcl
variable "project_id" {}
variable "region" {}
```

## envs/dev/terraform.tfvars

```hcl
project_id = "YOUR_PROJECT_ID"
region     = "us-central1"
```

---

# Production Environment

## envs/prod/main.tf

```hcl
terraform {
  required_version = ">= 1.6.0"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

module "network" {
  source = "../../modules/network"

  project_id = var.project_id
  region = var.region

  vpc_name = "prod-vpc"

  subnet_name = "prod-subnet"

  subnet_cidr = "10.20.1.0/24"
}
```

## envs/prod/variables.tf

```hcl
variable "project_id" {}
variable "region" {}
```

## envs/prod/terraform.tfvars

```hcl
project_id = "YOUR_PROJECT_ID"
region     = "us-central1"
```

---

# Terraform Commands

Initialize

```bash
terraform init
```

Validate

```bash
terraform validate
```

Plan

```bash
terraform plan
```

Apply

```bash
terraform apply
```

Destroy

```bash
terraform destroy
```

---

# Target Resources

Development 