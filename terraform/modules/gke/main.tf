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