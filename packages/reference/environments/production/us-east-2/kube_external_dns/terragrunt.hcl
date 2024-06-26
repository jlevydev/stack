include "panfactum" {
  path   = find_in_parent_folders("panfactum.hcl")
  expose = true
}

terraform {
  source = include.panfactum.locals.pf_stack_source
}

dependency "cluster" {
  config_path = "../aws_eks"
}

dependency "cert_issuers" {
  config_path = "../kube_cert_issuers"
}

inputs = {
  eks_cluster_name = dependency.cluster.outputs.cluster_name
  route53_zones    = dependency.cert_issuers.outputs.route53_zones

  pull_through_cache_enabled = true
  vpa_enabled                = true
}


