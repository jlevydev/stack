variable "cloudnative_pg_helm_version" {
  description = "The version of the cloudnative-pg helm chart to deploy"
  type        = string
  default     = "v0.21.2"
}

variable "vpa_enabled" {
  description = "Whether the VPA resources should be enabled"
  type        = bool
  default     = true
}

variable "pull_through_cache_enabled" {
  description = "Whether to use the ECR pull through cache for the deployed images"
  type        = bool
  default     = true
}


variable "node_image_cache_enabled" {
  description = "Whether to use kube-fledged to cache images locally for better startup performance"
  type        = bool
  default     = true
}

variable "log_level" {
  description = "The log level for the operator pods"
  type        = string
  default     = "error"
  validation {
    condition     = contains(["info", "error", "trace", "debug"], var.log_level)
    error_message = "Invalid log_level provided."
  }
}

variable "monitoring_enabled" {
  description = "Whether to add active monitoring to the deployed systems"
  type        = bool
  default     = false
}

variable "panfactum_scheduler_enabled" {
  description = "Whether to use the Panfactum pod scheduler with enhanced bin-packing"
  type        = bool
  default     = true
}

variable "enhanced_ha_enabled" {
  description = "Whether to add extra high-availability scheduling constraints at the trade-off of increased cost"
  type        = bool
  default     = true
}

