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

locals {
  service   = "aws-ebs-csi-driver"
  namespace = module.namespace.namespace

  controller_match_labels = {
    id = random_id.controller_id.hex
  }
}

module "pull_through" {
  count  = var.pull_through_cache_enabled ? 1 : 0
  source = "../aws_ecr_pull_through_cache_addresses"
}

resource "random_id" "controller_id" {
  prefix      = "ebs-controller-"
  byte_length = 8
}


module "kube_labels" {
  source = "../kube_labels"

  # generate: common_vars_no_extra_tags.snippet.txt
  pf_stack_version = var.pf_stack_version
  pf_stack_commit  = var.pf_stack_commit
  environment      = var.environment
  region           = var.region
  pf_root_module   = var.pf_root_module
  pf_module        = var.pf_module
  is_local         = var.is_local
  # end-generate

  extra_tags = merge(var.extra_tags, { service = local.service })
}

module "constants" {
  source = "../constants"

  matching_labels = local.controller_match_labels

  # generate: common_vars_no_extra_tags.snippet.txt
  pf_stack_version = var.pf_stack_version
  pf_stack_commit  = var.pf_stack_commit
  environment      = var.environment
  region           = var.region
  pf_root_module   = var.pf_root_module
  pf_module        = var.pf_module
  is_local         = var.is_local
  # end-generate

  extra_tags = merge(var.extra_tags, { service = local.service })
}

/***************************************
* Namespace
***************************************/

module "namespace" {
  source = "../kube_namespace"

  namespace = local.service

  # generate: pass_common_vars.snippet.txt
  pf_stack_version = var.pf_stack_version
  pf_stack_commit  = var.pf_stack_commit
  environment      = var.environment
  region           = var.region
  pf_root_module   = var.pf_root_module
  is_local         = var.is_local
  extra_tags       = var.extra_tags
  # end-generate
}

/***************************************
* AWS Permissions
***************************************/
data "aws_region" "main" {}

resource "kubernetes_service_account" "ebs_csi" {
  metadata {
    name      = local.service
    namespace = local.namespace
    labels    = module.kube_labels.kube_labels
  }
}

data "aws_iam_policy_document" "extra_permissions" {
  statement {
    effect = "Allow"
    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKeyWithoutPlaintext",
      "kms:CreateGrant"
    ]
    resources = ["*"]
  }
}

module "aws_permissions" {
  source = "../kube_sa_auth_aws"

  service_account           = kubernetes_service_account.ebs_csi.metadata[0].name
  service_account_namespace = kubernetes_service_account.ebs_csi.metadata[0].namespace
  eks_cluster_name          = var.eks_cluster_name
  iam_policy_json           = data.aws_iam_policy_document.extra_permissions.json
  ip_allow_list             = var.aws_iam_ip_allow_list

  # generate: pass_common_vars.snippet.txt
  pf_stack_version = var.pf_stack_version
  pf_stack_commit  = var.pf_stack_commit
  environment      = var.environment
  region           = var.region
  pf_root_module   = var.pf_root_module
  is_local         = var.is_local
  extra_tags       = var.extra_tags
  # end-generate
}

resource "aws_iam_role_policy_attachment" "default_permissions" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
  role       = module.aws_permissions.role_name
}

/***************************************
* CSI Driver
***************************************/

resource "helm_release" "ebs_csi_driver" {
  namespace       = local.namespace
  name            = local.service
  repository      = "https://kubernetes-sigs.github.io/aws-ebs-csi-driver"
  chart           = "aws-ebs-csi-driver"
  version         = var.aws_ebs_csi_driver_helm_version
  recreate_pods   = true
  cleanup_on_fail = true
  wait            = true
  wait_for_jobs   = true

  values = [
    yamlencode({

      image = {
        repository = "${var.pull_through_cache_enabled ? module.pull_through[0].ecr_public_registry : "public.ecr.aws"}/ebs-csi-driver/aws-ebs-csi-driver"
      }
      labels = module.kube_labels.kube_labels

      controller = {
        replicaCount = 2
        tolerations  = module.constants.burstable_node_toleration_helm
        affinity = merge(
          module.constants.controller_node_with_burstable_affinity_helm,
          module.constants.pod_anti_affinity_helm
        )
        topologySpreadConstraints = module.constants.topology_spread_zone_preferred
        serviceAccount = {
          create                       = false
          name                         = kubernetes_service_account.ebs_csi.metadata[0].name
          autoMountServiceAccountToken = true
        }
        podAnnotations = {
          "config.alpha.linkerd.io/proxy-enable-native-sidecar" = "true"
        }
        podLabels = merge(module.kube_labels.kube_labels, local.controller_match_labels)
        resources = {
          requests = {
            memory = "100Mi"
          }
          limits = {
            memory = "130Mi"
          }
        }
      }

      sidecars = {
        provisioner = {
          image = {
            repository = "${var.pull_through_cache_enabled ? module.pull_through[0].ecr_public_registry : "public.ecr.aws"}/eks-distro/kubernetes-csi/external-provisioner"
          }
          resources = {
            requests = {
              memory = "100Mi"
            }
            limits = {
              memory = "130Mi"
            }
          }
        }
        attacher = {
          image = {
            repository = "${var.pull_through_cache_enabled ? module.pull_through[0].ecr_public_registry : "public.ecr.aws"}/eks-distro/kubernetes-csi/external-attacher"
          }
          resources = {
            requests = {
              memory = "100Mi"
            }
            limits = {
              memory = "130Mi"
            }
          }
        }
        resizer = {
          image = {
            repository = "${var.pull_through_cache_enabled ? module.pull_through[0].ecr_public_registry : "public.ecr.aws"}/eks-distro/kubernetes-csi/external-resizer"
          }
          resources = {
            requests = {
              memory = "100Mi"
            }
            limits = {
              memory = "130Mi"
            }
          }
        }
        livenessProbe = {
          image = {
            repository = "${var.pull_through_cache_enabled ? module.pull_through[0].ecr_public_registry : "public.ecr.aws"}/eks-distro/kubernetes-csi/livenessprobe"
          }
          resources = {
            requests = {
              memory = "100Mi"
            }
            limits = {
              memory = "130Mi"
            }
          }
        }
        nodeDriverRegistrar = {
          image = {
            repository = "${var.pull_through_cache_enabled ? module.pull_through[0].ecr_public_registry : "public.ecr.aws"}/eks-distro/kubernetes-csi/node-driver-registrar"
          }
          resources = {
            requests = {
              memory = "100Mi"
            }
            limits = {
              memory = "130Mi"
            }
          }
        }
        volumemodifier = {
          image = {
            repository = "${var.pull_through_cache_enabled ? module.pull_through[0].ecr_public_registry : "public.ecr.aws"}/ebs-csi-driver/volume-modifier-for-k8s"
          }
          resources = {
            requests = {
              memory = "100Mi"
            }
            limits = {
              memory = "130Mi"
            }
          }
        }
        snapshotter = {
          forceEnable = true
          image = {
            repository = "${var.pull_through_cache_enabled ? module.pull_through[0].ecr_public_registry : "public.ecr.aws"}/eks-distro/kubernetes-csi/external-snapshotter/csi-snapshotter"
          }
          resources = {
            requests = {
              memory = "100Mi"
            }
            limits = {
              memory = "130Mi"
            }
          }
        }
      }

      node = {
        serviceAccount = {
          create                       = false
          name                         = kubernetes_service_account.ebs_csi.metadata[0].name
          autoMountServiceAccountToken = true
        }
        resources = {
          requests = {
            memory = "100Mi"
          }
          limits = {
            memory = "130Mi"
          }
        }
      }
    })
  ]
  depends_on = [module.aws_permissions]
}

/***************************************
* Storage Classes
***************************************/

resource "kubernetes_storage_class" "standard" {
  metadata {
    name = "ebs-standard"
    annotations = {
      "storageclass.kubernetes.io/is-default-class" = "true"
    }
  }
  storage_provisioner    = "ebs.csi.aws.com"
  volume_binding_mode    = "WaitForFirstConsumer"
  allow_volume_expansion = true
  reclaim_policy         = "Delete"

  parameters = {
    type      = "gp3"
    encrypted = true
    tagSpecification_1 : "Name={{ .PVCNamespace }}/{{ .PVCName }}"
  }
}

resource "kubernetes_storage_class" "standard_retained" {
  metadata {
    name = "ebs-standard-retained"
  }
  storage_provisioner    = "ebs.csi.aws.com"
  volume_binding_mode    = "WaitForFirstConsumer"
  allow_volume_expansion = true
  reclaim_policy         = "Retain"
  parameters = {
    type      = "gp3"
    encrypted = true
    tagSpecification_1 : "Name={{ .PVCNamespace }}/{{ .PVCName }}"
  }
}

/***************************************
* VPA
***************************************/

resource "kubernetes_manifest" "vpa_deployment" {
  count = var.vpa_enabled ? 1 : 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind       = "VerticalPodAutoscaler"
    metadata = {
      name      = "ebs-csi-driver-deployment"
      namespace = local.namespace
      labels    = module.kube_labels.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind       = "Deployment"
        name       = "ebs-csi-controller"
      }
    }
  }
}

resource "kubernetes_manifest" "vpa_daemonset" {
  count = var.vpa_enabled ? 1 : 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind       = "VerticalPodAutoscaler"
    metadata = {
      name      = "ebs-csi-driver-daemonset"
      namespace = local.namespace
      labels    = module.kube_labels.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind       = "DaemonSet"
        name       = "ebs-csi-node"
      }
    }
  }
}
