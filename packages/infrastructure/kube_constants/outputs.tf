output "cilium_taint" {
  description = "The taint added to every node before the Cilium pods are ready (i.e., when networking is unavailable)"
  value = {
    key    = "node.cilium.io/agent-not-ready"
    value  = "true"
    effect = "NoSchedule"
  }
}

output "controller_taint" {
  description = "The taint added to every EKS nodes"
  value = {
    key    = "panfactum.com/class"
    value  = "controller"
    effect = "NoSchedule"
  }
}

output "default_priority_class_name" {
  description = "The default Kubernetes Priority Class"
  value       = "default"
}

output "workload_important_priority_class_name" {
  description = "A Kubernetes Priority Class that is higher than the default but lower than cluster-important. Generally, all stateful systems should have this priority class."
  value       = "workload-important"
}

output "cluster_important_priority_class_name" {
  description = "A Kubernetes Priority Class that is higher than the workload-important but lower than system-cluster-critical."
  value       = "cluster-important"
}

output "panfactum_scheduler_name" {
  description = "The name to use for the 'schedulerName' pod spec field when you want to use the Panfactum bin-packing pod scheduler."
  value       = "panfactum"
}

output "panfactum_image_repository" {
  description = "The repository of the Panfactum devShell image with the AWS public ECR registry (public.ecr.aws)."
  value       = "t8f0s7h5/panfactum"
}

output "panfactum_image_tag" {
  description = "The tag of the Panfactum devShell image that is compatible with this module's version of the Panfactum stack."
  value       = "8872c1bd7032bee5e609137ba80b061295d44c3a"
}
