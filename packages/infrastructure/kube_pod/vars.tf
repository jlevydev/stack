variable "namespace" {
  description = "The namespace where the pod will run"
  type        = string
}

variable "workload_name" {
  description = "The name of the workload. Used by observability platform for grouping pods."
  type        = string
  default     = null
}

variable "match_labels" {
  description = "kubernetes labels to use in selectors to match the workload"
  type        = map(string)
  default     = null
}

variable "containers" {
  description = "A list of container configurations for the pod"
  type = list(object({
    name                    = string
    init                    = optional(bool, false)
    image                   = string
    version                 = string
    command                 = list(string)
    image_pull_policy       = optional(string, "IfNotPresent")
    working_dir             = optional(string, null)
    privileged              = optional(bool, false)        # Whether to allow the container to run in privileged mode
    minimum_memory          = optional(number, 100)        # The minimum amount of memory in megabytes
    maximum_memory          = optional(number, null)       #The maximum amount of memory in megabytes
    memory_limit_multiplier = optional(number, 1.3)        # memory limits = memory request x this value
    minimum_cpu             = optional(number, 10)         # The minimum amount of cpu millicores
    maximum_cpu             = optional(number, null)       # The maximum amount of cpu to allow (in millicores)
    run_as_root             = optional(bool, false)        # Whether to run the container as root
    uid                     = optional(number, 1000)       # user to use when running the container if not root
    linux_capabilities      = optional(list(string), [])   # Default is drop ALL
    readonly                = optional(bool, true)         # Whether to use a readonly file system
    env                     = optional(map(string), {})    # Environment variables specific to the container
    liveness_check_command  = optional(list(string), null) # Will run the specified command as the liveness probe if type is exec
    liveness_check_port     = optional(number, null)       # The number of the port for the liveness_check
    liveness_check_type     = optional(string, null)       # Either exec, HTTP, or TCP
    liveness_check_route    = optional(string, null)       # The route if using HTTP liveness_checks
    liveness_check_scheme   = optional(string, "HTTP")     # HTTP or HTTPS
    ready_check_command     = optional(list(string), null) # Will run the specified command as the ready check probe if type is exec (default to liveness_check_command)
    ready_check_port        = optional(number, null)       # The number of the port for the ready check (default to liveness_check_port)
    ready_check_type        = optional(string, null)       # Either exec, HTTP, or TCP (default to liveness_check_type)
    ready_check_route       = optional(string, null)       # The route if using HTTP ready checks (default to liveness_check_route)
    ready_check_scheme      = optional(string, null)       # Whether to use HTTP or HTTPS (default to liveness_check_scheme)
  }))
}

variable "restart_policy" {
  description = "The pod restart policy"
  type        = string
  default     = "Always"
}

variable "common_env" {
  description = "Key pair values of the environment variables for each container"
  type        = map(string)
  default     = {}
}

variable "pod_annotations" {
  description = "Annotations to add to the pods in the deployment"
  type        = map(string)
  default     = {}
}

variable "extra_pod_labels" {
  description = "Extra pod labels to use"
  type        = map(string)
  default     = {}
}

variable "service_account" {
  description = "The name of the service account to use for this deployment"
  type        = string
  default     = null
}

variable "tmp_directories" {
  description = "A mapping of temporary directory names (arbitrary) to their configuration"
  type = map(object({
    mount_path = string                # Where in the containers to mount the temporary directories
    size_mb    = optional(number, 100) # The number of MB to allocate for the directory
    node_local = optional(bool, false) # If true, the temporary storage will come from the node rather than a PVC
  }))
  default = {}
}

variable "secret_mounts" {
  description = "A mapping of Secret names to their mount configuration in the containers of the Pod"
  type = map(object({
    mount_path = string                # Where in the containers to mount the Secret
    optional   = optional(bool, false) # Whether the pod can launch if this Secret does not exist
  }))
  default = {}
}

variable "config_map_mounts" {
  description = "A mapping of ConfigMap names to their mount configuration in the containers of the Pod"
  type = map(object({
    mount_path = string                # Where in the containers to mount the ConfigMap
    optional   = optional(bool, false) # Whether the pod can launch if this ConfigMap does not exist
  }))
  default = {}
}

variable "extra_volume_mounts" {
  description = "A mapping of volume names to their mount configuration in the containers of the Pod. Used for dynamically generated Volumes such as in StatefulSets."
  type = map(object({
    mount_path = string # Where in the containers to mount the Volume
  }))
  default = {}
}

variable "mount_owner" {
  description = "The ID of the group that owns the mounted volumes"
  type        = number
  default     = 1000
}

variable "dynamic_secrets" {
  description = "Dynamic variable secrets"
  type = list(object({             // key is the secret provider class
    secret_provider_class = string // name of the secret provider class
    mount_path            = string // absolute path of where to mount the secret
    env_var               = string // name of the env var that will have a path to the secret mount
  }))
  default = []
}

variable "node_preferences" {
  description = "Node label preferences for the pod"
  type        = map(object({ weight = number, operator = string, values = list(string) }))
  default     = {}
}

variable "node_requirements" {
  description = "Node label requirements for the pod"
  type        = map(list(string))
  default     = {}
}

variable "secrets" {
  description = "Key pair values of secrets to add to the containers as environment variables"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "extra_tolerations" {
  description = "Extra tolerations to add to the pods"
  type = list(object({
    key      = optional(string)
    operator = string
    value    = optional(string)
    effect   = optional(string)
  }))
  default = []
}

variable "priority_class_name" {
  description = "The priority class to use for pods in the deployment"
  type        = string
  default     = null
}

variable "dns_policy" {
  description = "The DNS policy for the pod"
  type        = string
  default     = "ClusterFirst"
}

variable "controller_node_required" {
  description = "Whether the pods must be scheduled on a controller node"
  type        = bool
  default     = false
}

variable "prefer_spot_nodes_enabled" {
  description = "Whether pods will prefer scheduling on spot nodes"
  type        = bool
  default     = false
}

variable "prefer_burstable_nodes_enabled" {
  description = "Whether pods will prefer scheduling on burstable nodes"
  type        = bool
  default     = false
}

variable "prefer_arm_nodes_enabled" {
  description = "Whether pods will prefer scheduling on arm64 nodes"
  type        = bool
  default     = false
}

variable "spot_nodes_enabled" {
  description = "Whether to allow pods to schedule on spot nodes"
  type        = bool
  default     = false
}

variable "burstable_nodes_enabled" {
  description = "Whether to allow pods to schedule on burstable nodes"
  type        = bool
  default     = false
}

variable "arm_nodes_enabled" {
  description = "Whether to allow pods to schedule on arm64 nodes"
  type        = bool
  default     = false
}

variable "topology_spread_strict" {
  description = "Whether the topology spread constraint should be set to DoNotSchedule"
  type        = bool
  default     = false
}

variable "topology_spread_enabled" {
  description = "Whether to enable topology spread constraints"
  type        = bool
  default     = true
}

variable "instance_type_anti_affinity_required" {
  description = "Whether to prevent pods from being scheduled on the same instance types"
  type        = bool
  default     = false
}

variable "zone_anti_affinity_required" {
  description = "Whether to prevent pods from being scheduled on the same zone"
  type        = bool
  default     = false
}

variable "instance_type_anti_affinity_preferred" {
  description = "Whether to prefer preventing pods from being scheduled on the same instance types"
  type        = bool
  default     = false
}

variable "host_anti_affinity_required" {
  description = "Whether to prefer preventing pods from being scheduled on the same host"
  type        = bool
  default     = true
}

variable "panfactum_scheduler_enabled" {
  description = "Whether to use the Panfactum pod scheduler"
  type        = bool
  default     = true
}

variable "termination_grace_period_seconds" {
  description = "The number of seconds to wait for graceful termination before forcing termination"
  type        = number
  default     = 30
}

variable "pod_version_labels_enabled" {
  description = "Whether to add version labels to the Pod. Useful for ensuring pods do not get recreated on frequent updates."
  type        = bool
  default     = true
}

