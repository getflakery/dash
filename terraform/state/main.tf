terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}


provider "aws" {
  region = "us-west-2"
}

# Define an additional provider for us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}


# create policy
resource "aws_iam_policy" "github_actions" {
  name        = "github-actions-policy"
  description = "Policy for GitHub Actions"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
            "ecr:*",
            "ecr-public:*",
            "sts:GetServiceBearerToken"
        ]
        Resource = "*"
      },
    ]
  })
}


module "github-oidc" {
  source  = "terraform-module/github-oidc-provider/aws"
  version = "~> 1"

  create_oidc_provider = true
  create_oidc_role     = true

  repositories = [
    "getflakery/dash"
  ]
  oidc_role_attach_policies = [
    aws_iam_policy.github_actions.arn
  ]
}

# You cannot create a new backend by simply defining this and then
# immediately proceeding to "terraform apply". The S3 backend must
# be bootstrapped according to the simple yet essential procedure in
# https://github.com/cloudposse/terraform-aws-tfstate-backend#usage
module "terraform_state_backend" {
  source = "cloudposse/tfstate-backend/aws"
  # Cloud Posse recommends pinning every module to a specific version
  # version     = "x.x.x"
  namespace  = "flakery"
  stage      = "prod"
  name       = "terraform"
  attributes = ["state"]

  terraform_backend_config_file_path = "."
  terraform_backend_config_file_name = "backend.tf"
  force_destroy                      = false
}



# add public ecr repository for flakery
resource "aws_ecrpublic_repository" "flakery" {
  provider = aws.us_east_1
  repository_name = "flakery"
}

output "ecr_repository_url" {
  value = aws_ecrpublic_repository.flakery.repository_uri
}

output "ecr_repository_name" {
  value = aws_ecrpublic_repository.flakery.repository_name
  
}

output "ecr_repository_registry_id" {
  value = aws_ecrpublic_repository.flakery.registry_id
}

output "oidc_provider_arn" {
  description = "OIDC provider ARN"
  value       = module.github-oidc.oidc_provider_arn
}

output "github_oidc_role_arn" {
  description = "CICD GitHub role."
  value       = module.github-oidc.oidc_role
}


