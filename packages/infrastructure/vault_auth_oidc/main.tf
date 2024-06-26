// Live

terraform {
  required_providers {
    vault = {
      source  = "hashicorp/vault"
      version = "3.25.0"
    }
  }
}

/***************************************
* Setup Vault for User Auth
***************************************/

resource "vault_jwt_auth_backend" "oidc" {
  description        = "Authentication using OIDC"
  path               = "oidc"
  type               = "oidc"
  oidc_client_id     = var.client_id
  oidc_client_secret = var.client_secret
  oidc_discovery_url = var.oidc_discovery_url
  bound_issuer       = var.oidc_issuer
  default_role       = "default"
  tune {
    max_lease_ttl     = "${var.token_lifetime_seconds}s"
    default_lease_ttl = "${var.token_lifetime_seconds}s"
    token_type        = "default-service"
  }
}

resource "vault_jwt_auth_backend_role" "default" {
  backend                = vault_jwt_auth_backend.oidc.path
  role_name              = "default"
  oidc_scopes            = ["profile"]
  user_claim             = "sub"
  groups_claim           = "groups"
  allowed_redirect_uris  = var.oidc_redirect_uris
  max_age                = var.token_lifetime_seconds
  token_explicit_max_ttl = var.token_lifetime_seconds
}


/***************************************
* Roles
***************************************/

/*************************  Superusers ***********************************/

data "vault_policy_document" "superusers" {
  rule {
    path         = "secret/*"
    capabilities = ["create", "read", "update", "patch", "delete", "list"]
    description  = "allow all on secrets"
  }
  rule {
    path         = "auth/*"
    capabilities = ["sudo", "create", "read", "update", "patch", "delete", "list"]
    description  = "allow all on auth"
  }
  rule {
    path         = "sys/*"
    capabilities = ["sudo", "create", "read", "update", "patch", "delete", "list"]
    description  = "allow all on sys"
  }
  rule {
    path         = "identity/*"
    capabilities = ["create", "read", "update", "patch", "delete", "list"]
    description  = "allow all on identity"
  }
  rule {
    path         = "pki/*"
    capabilities = ["sudo", "create", "read", "update", "patch", "delete", "list"]
    description  = "allow all on pki infrastructure"
  }
  rule {
    path         = "db/*"
    capabilities = ["create", "read", "update", "patch", "delete", "list"]
    description  = "allow all on db infrastructure"
  }
  rule {
    path         = "transit/*"
    capabilities = ["create", "read", "update", "patch", "delete", "list"]
    description  = "allows interacting with the transit secrets engine"
  }
  rule {
    path         = "ssh/*"
    capabilities = ["create", "read", "update", "patch", "delete", "list"]
    description  = "allows management of ssh signing for bastion authentication"
  }
}

resource "vault_policy" "superusers" {
  name   = "superuser"
  policy = data.vault_policy_document.superusers.hcl
}

resource "vault_identity_group" "superusers" {
  for_each = toset(concat(var.superuser_groups, ["superusers"]))
  name     = each.key
  type     = "external"
  policies = [vault_policy.superusers.name]
}

resource "vault_identity_group_alias" "superusers" {
  for_each       = toset(concat(var.superuser_groups, ["superusers"]))
  canonical_id   = vault_identity_group.superusers[each.key].id
  mount_accessor = vault_jwt_auth_backend.oidc.accessor
  name           = each.key
}


/*************************  Admins ***********************************/

data "vault_policy_document" "admins" {
  rule {
    path         = "secret/*"
    capabilities = ["create", "read", "update", "patch", "delete", "list"]
    description  = "allow all on secrets"
  }
  rule {
    path         = "auth/*"
    capabilities = ["create", "read", "update", "patch", "delete", "list"]
    description  = "allow all on auth"
  }
  rule {
    path         = "sys/*"
    capabilities = ["create", "read", "update", "patch", "delete", "list"]
    description  = "allow all on sys"
  }
  rule {
    path         = "identity/*"
    capabilities = ["create", "read", "update", "patch", "delete", "list"]
    description  = "allow all on identity"
  }
  rule {
    path         = "pki/*"
    capabilities = ["create", "read", "update", "patch", "delete", "list"]
    description  = "allow all on pki infrastructure"
  }
  rule {
    path         = "db/*"
    capabilities = ["create", "read", "update", "patch", "delete", "list"]
    description  = "allow all on db infrastructure"
  }
  rule {
    path         = "transit/*"
    capabilities = ["create", "read", "update", "patch", "delete", "list"]
    description  = "allows interacting with the transit secrets engine"
  }
  rule {
    path         = "ssh/*"
    capabilities = ["create", "read", "update", "patch", "delete", "list"]
    description  = "allows management of ssh signing for bastion authentication"
  }
}

resource "vault_policy" "admins" {
  name   = "admin"
  policy = data.vault_policy_document.admins.hcl
}

resource "vault_identity_group" "admins" {
  for_each = toset(var.admin_groups)
  name     = each.key
  type     = "external"
  policies = [vault_policy.admins.name]
}

resource "vault_identity_group_alias" "admins" {
  for_each       = toset(var.admin_groups)
  canonical_id   = vault_identity_group.admins[each.key].id
  mount_accessor = vault_jwt_auth_backend.oidc.accessor
  name           = each.key
}

/*************************  Readers ***********************************/

data "vault_policy_document" "readers" {
  rule {
    path         = "secret/*"
    capabilities = ["read", "list"]
    description  = "allow read on secrets"
  }
  rule {
    path         = "auth/*"
    capabilities = ["read", "list"]
    description  = "allow read on auth"
  }
  rule {
    path         = "identity/*"
    capabilities = ["read", "list"]
    description  = "allow read on identity"
  }
  rule {
    path         = "pki/*"
    capabilities = ["read", "list"]
    description  = "allow read on pki infrastructure"
  }
  rule {
    path         = "db/creds/reader*"
    capabilities = ["read", "list"]
    description  = "allows getting credentials for read-only database roles"
  }
  rule {
    path         = "ssh/*"
    capabilities = ["read", "list"]
    description  = "allows getting ssh keys signed for bastion authentication"
  }
}

resource "vault_policy" "readers" {
  name   = "reader"
  policy = data.vault_policy_document.readers.hcl
}

resource "vault_identity_group" "readers" {
  for_each = toset(var.reader_groups)
  name     = each.key
  type     = "external"
  policies = [vault_policy.readers.name]
}

resource "vault_identity_group_alias" "readers" {
  for_each       = toset(var.reader_groups)
  canonical_id   = vault_identity_group.readers[each.key].id
  mount_accessor = vault_jwt_auth_backend.oidc.accessor
  name           = each.key
}


