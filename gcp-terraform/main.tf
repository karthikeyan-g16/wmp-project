terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}
provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {}
variable "region" {}
variable "zones" {
  description = "Zones the node pool will span for HA"
  type        = list(string)  
}

resource "google_compute_network" "vpc" {
  name                    = "wmp-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "wmp-subnet"
  ip_cidr_range = "10.10.0.0/20"
  region        = var.region
  network       = google_compute_network.vpc.id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.20.0.0/14"
  }
  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.30.0.0/20"
  }

  private_ip_google_access = true
}

resource "google_compute_router" "router" {
  name    = "wmp-router"
  network = google_compute_network.vpc.id
  region  = var.region
}

resource "google_compute_router_nat" "nat" {
  name                               = "wmp-nat"
  router                             = google_compute_router.router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

resource "google_compute_firewall" "allow_health_checks" {
  name    = "wmp-allow-health-checks"
  network = google_compute_network.vpc.id
  allow {
    protocol = "tcp"
  }
  source_ranges = ["130.211.0.0/22", "35.191.0.0/16"]
  target_tags   = ["gke-node"]
}

# GKE Standard REGIONAL cluster (manual mode)
# Regional = HA control plane across 3 zones
##############################################

resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.region # regional cluster -> HA control plane in 3 zones
  node_locations = var.zones

  # Manual node pool management: remove default pool, define our own below
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.vpc.id
  subnetwork = google_compute_subnetwork.subnet.id

  networking_mode = "VPC_NATIVE"
  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  release_channel {
    channel = "REGULAR"
  }

  # Required for BackendConfig/Cloud CDN via GKE Ingress
  addons_config {
    http_load_balancing {
      disabled = false
    }
  }

  deletion_protection = false # sandbox: allow terraform destroy
}

# Manually managed node pool spread across all 3 zones = HA nodes
resource "google_container_node_pool" "primary_nodes" {
  name       = "${var.cluster_name}-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  node_count = var.nodes_per_zone # per zone, since node_locations has 3 zones

  node_locations = var.zones

  management {
    auto_repair  = true
    auto_upgrade = true
  }

  autoscaling {
    min_node_count = 1
    max_node_count = 3
  }

  node_config {
    machine_type = var.machine_type
    tags         = ["gke-node"]
    oauth_scopes = ["https://www.googleapis.com/auth/cloud-platform"]
    labels = {
      env = "sandbox"
    }
  }
}

##############################################
# Reserved global static IP for the HTTPS LB
##############################################

resource "google_compute_global_address" "wmp_ip" {
  name         = "wmp-global-ip"
  address_type = "EXTERNAL"
}


##############################################
# Outputs
##############################################

output "cluster_name" {
  value = google_container_cluster.primary.name
}

output "cluster_endpoint" {
  value     = google_container_cluster.primary.endpoint
  sensitive = true
}

output "load_balancer_ip" {
  value = google_compute_global_address.wmp_ip.address
}

output "dns_name_servers" {
  value = google_dns_managed_zone.wmp_zone.name_servers
}

output "get_credentials_command" {
  value = "gcloud container clusters get-credentials ${var.cluster_name} --region ${var.region} --project ${var.project_id}"
}