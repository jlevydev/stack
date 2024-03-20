// Live

terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.27.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "2.12.1"
    }
  }
}

module "trust_manager_labels" {
  source         = "../kube_labels"
  environment    = var.environment
  pf_root_module = var.pf_root_module
  pf_module      = var.pf_module
  region         = var.region
  is_local       = var.is_local
  extra_tags = merge(var.extra_tags, {
    service = "${var.namespace}-trust-manager"
  })
}

module "trust_manager_constants" {
  source          = "../constants"
  matching_labels = module.trust_manager_labels.kube_labels
  environment     = var.environment
  pf_root_module  = var.pf_root_module
  region          = var.region
  is_local        = var.is_local
  extra_tags      = var.extra_tags
}

/***************************************
* Trust-manager
***************************************/

resource "helm_release" "trust_manager" {
  namespace       = var.namespace
  name            = "trust-manager"
  repository      = "https://charts.jetstack.io"
  chart           = "trust-manager"
  version         = var.trust_manager_version
  recreate_pods   = true
  cleanup_on_fail = true
  wait            = true
  wait_for_jobs   = true

  values = [
    yamlencode({
      crds = {
        enabled = true
      }
      app = {
        trust = {
          namespace = var.namespace
        }
        podLabels = module.trust_manager_labels.kube_labels
      }

      // Does not need to be highly available
      replicaCount = 1
      tolerations  = module.trust_manager_constants.spot_node_toleration_helm
      affinity     = module.trust_manager_constants.controller_node_with_spot_affinity_helm
    })
  ]

  // We want to use our secured internal certificate issuer
  // instead of the default self-signed one
  postrender {
    binary_path = "${path.module}/trust_manager_kustomize/kustomize.sh"
  }
}

resource "kubernetes_manifest" "vpa" {
  count = var.vpa_enabled ? 1 : 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind       = "VerticalPodAutoscaler"
    metadata = {
      name      = "trust-manager"
      namespace = var.namespace
      labels    = module.trust_manager_labels.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind       = "Deployment"
        name       = "trust-manager"
      }
    }
  }
}