variable "cluster_name" {
  type    = string
  
}

variable "machine_type" {
  type    = string
  
}

variable "nodes_per_zone" {
  description = "Manual node count per zone (min for HA = 1, recommended 2)"
  type        = number
  default     = 1
}