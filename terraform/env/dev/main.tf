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