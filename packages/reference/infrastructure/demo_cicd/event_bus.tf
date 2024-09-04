module "event_bus" {
  source =   "../../../../../infrastructure//kube_argo_event_bus" # pf-update

  namespace = local.namespace

  instance_type_spread_required = false // You probably want to leave this as true, but we disable this for cost savings

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
