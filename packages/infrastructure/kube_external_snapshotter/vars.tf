
// From https://artifacthub.io/packages/helm/piraeus-charts/snapshot-controller
variable "external_snapshotter_helm_version" {
  description = "The version of the external-snapshotter helm chart to deploy"
  type        = string
  default     = "2.2.0"
}

variable "vpa_enabled" {
  description = "Whether the VPA resources should be enabled"
  type        = bool
  default     = false
}

variable "pull_through_cache_enabled" {
  description = "Whether to use the ECR pull through cache for the deployed images"
  type        = bool
  default     = false
}

variable "log_verbosity" {
  description = "The log verbosity (0-9) for the VPA pods"
  type        = number
  default     = 0
}