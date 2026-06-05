terraform {
  required_version = ">= 1.6.0"
}

variable "project_name" {
  type    = string
  default = "mdh3d-local-first"
}

variable "environment" {
  type    = string
  default = "local"
}

locals {
  labels = {
    project     = var.project_name
    environment = var.environment
  }
}

output "blueprint" {
  value = {
    note   = "Blueprint only. Do not apply without provider, budget, secrets review, and owner approval."
    labels = local.labels
  }
}
