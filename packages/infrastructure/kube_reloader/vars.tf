variable "reloader_helm_version" {
  description = "The image version of the stakater/reloader helm chart"
  type        = string
  default     = "1.0.72"
}

variable "pull_through_cache_enabled" {
  description = "Whether to use the ECR pull through cache for the deployed images"
  type        = bool
  default     = false
}

variable "vpa_enabled" {
  description = "Whether the VPA resources should be enabled"
  type        = bool
  default     = false
}
