variable "kube_prometheus_stack_version" {
  description = "The version of the kube-prometheus-stack to deploy"
  type        = string
  default     = "58.5.3"
}

variable "thanos_chart_version" {
  description = "The version of the bitnami/thanos helm chart to deploy"
  type        = string
  default     = "15.4.7"
}

variable "thanos_image_version" {
  description = "The version of thanos images to use"
  type        = string
  default     = "v0.35.0"
}

variable "eks_cluster_name" {
  description = "The name of the EKS cluster."
  type        = string
}

variable "aws_iam_ip_allow_list" {
  description = "A list of IPs that can use the service account token to authenticate with AWS API"
  type        = list(string)
  default     = []
}

variable "grafana_domain" {
  description = "The domain on which to expose Grafana."
  type        = string
}

variable "vpa_enabled" {
  description = "Whether the VPA resources should be enabled"
  type        = bool
  default     = false
}

variable "ingress_enabled" {
  description = "Whether or not to enable the ingress for routing public traffic to prometheus stack components"
  type        = bool
  default     = false
}

variable "pull_through_cache_enabled" {
  description = "Whether to use the ECR pull through cache for the deployed images"
  type        = bool
  default     = false
}

variable "prometheus_operator_log_level" {
  description = "The log level for the prometheus operator pods"
  type        = string
  default     = "info"
  validation {
    condition     = contains(["info", "error", "warn", "debug"], var.prometheus_operator_log_level)
    error_message = "Invalid prometheus_operator_log_level provided."
  }
}

variable "prometheus_log_level" {
  description = "The log level for the prometheus pods"
  type        = string
  default     = "info"
  validation {
    condition     = contains(["info", "error", "warn", "debug"], var.prometheus_log_level)
    error_message = "Invalid prometheus_log_level provided."
  }
}

variable "thanos_log_level" {
  description = "The log level for the thanos pods"
  type        = string
  default     = "info"
  validation {
    condition     = contains(["info", "error", "warn", "debug"], var.thanos_log_level)
    error_message = "Invalid thanos_log_level provided."
  }
}

variable "prometheus_default_scrape_interval_seconds" {
  description = "The default interval between prometheus scrapes (in seconds)"
  type        = number
  default     = 60
}

variable "prometheus_storage_class_name" {
  description = "The storage class to use for local prometheus storage"
  type        = string
  default     = "ebs-standard"
}

variable "prometheus_local_storage_initial_size_gb" {
  description = "Number of GB to use for the local prometheus storage (before autoscaled)"
  type        = number
  default     = 2
}

variable "metrics_retention_resolution_raw" {
  description = "Number of days the raw metrics resolution should be kept"
  type        = number
  default     = 15
}

variable "metrics_retention_resolution_5m" {
  description = "Number of days 5m metrics resolution should be kept"
  type        = number
  default     = 90
}

variable "metrics_retention_resolution_1h" {
  description = "Number of days 1h metrics resolution should be kept"
  type        = number
  default     = 365 * 5
}

variable "thanos_compactor_disk_storage_gb" {
  description = "Number of GB for the ephemeral thanos compactor disk. See https://thanos.io/tip/components/compact.md/#disk"
  type        = number
  default     = 100
}

variable "thanos_compactor_storage_class_name" {
  description = "The storage class to use for the thanos compactor local storage"
  type        = string
  default     = "ebs-standard"
}

variable "thanos_store_gateway_storage_class_name" {
  description = "The storage class to use for the thanos store gateway local storage"
  type        = string
  default     = "ebs-standard"
}

variable "thanos_bucket_web_enable" {
  description = "Whether to enable the web dashboard for the Thanos bucket analyzer which can show debugging information about your metrics data"
  type        = bool
  default     = true
}