terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.27.0"
    }
    kubectl = {
      source  = "alekc/kubectl"
      version = "2.0.4"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "5.39.1"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.6.0"
    }
  }
}

data "aws_region" "current" {}

locals {
  namespace = module.namespace.namespace
  ci_image = "${module.pull_through.github_registry}/panfactum/panfactum:17b5034568b63f0a777bc1f5b7ef907c0e00fa2a"
}

module "pull_through" {
  source =   "../../../../../infrastructure//aws_ecr_pull_through_cache_addresses" # pf-update
  pull_through_cache_enabled = true
}

module "namespace" {
  source =   "../../../../../infrastructure//kube_namespace" # pf-update

  namespace = "cicd"

  # pf-generate: pass_vars
  pf_stack_version = var.pf_stack_version
  pf_stack_commit  = var.pf_stack_commit
  environment      = var.environment
  region           = var.region
  pf_root_module   = var.pf_root_module
  is_local         = var.is_local
  extra_tags       = var.extra_tags
  # end-generate
}