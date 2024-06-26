locals {
  prefer_controller = {
    weight = 100
    preference = {
      matchExpressions = [
        {
          key      = "panfactum.com/class"
          operator = "In"
          values   = ["controller"]
        }
      ]
    }
  }
  prefer_spot = {
    weight = 50
    preference = {
      matchExpressions = [
        {
          key      = "panfactum.com/class"
          operator = "In"
          values   = ["spot"]
        }
      ]
    }
  }
  prefer_burstable = {
    weight = 25
    preference = {
      matchExpressions = [
        {
          key      = "panfactum.com/class"
          operator = "In"
          values   = ["burstable"]
        }
      ]
    }
  }
}
