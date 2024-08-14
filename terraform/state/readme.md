https://github.com/cloudposse/terraform-aws-tfstate-backend#usage

### Create

Follow this procedure just once to create your deployment.

1. Add the `terraform_state_backend` module to your `main.tf` file. The
   comment will help you remember to follow this procedure in the future:
   ```hcl
   # You cannot create a new backend by simply defining this and then
   # immediately proceeding to "terraform apply". The S3 backend must
   # be bootstrapped according to the simple yet essential procedure in
   # https://github.com/cloudposse/terraform-aws-tfstate-backend#usage
   module "terraform_state_backend" {
     source = "cloudposse/tfstate-backend/aws"
     # Cloud Posse recommends pinning every module to a specific version
     # version     = "x.x.x"
     namespace  = "eg"
     stage      = "test"
     name       = "terraform"
     attributes = ["state"]

     terraform_backend_config_file_path = "."
     terraform_backend_config_file_name = "backend.tf"
     force_destroy                      = false
   }
   ```
   Module inputs `terraform_backend_config_file_path` and
   `terraform_backend_config_file_name` control the name of the backend
   definition file. Note that when `terraform_backend_config_file_path` is
   empty (the default), no file is created.

1. `terraform init`. This downloads Terraform modules and providers.

1. `terraform apply -auto-approve`. This creates the state bucket and DynamoDB locking
   table, along with anything else you have defined in your `*.tf` file(s). At
   this point, the Terraform state is still stored locally.

   Module `terraform_state_backend` also creates a new `backend.tf` file
   that defines the S3 state backend. For example:
   ```hcl
   backend "s3" {
     region         = "us-east-1"
     bucket         = "< the name of the S3 state bucket >"
     key            = "terraform.tfstate"
     dynamodb_table = "< the name of the DynamoDB locking table >"
     profile        = ""
     role_arn       = ""
     encrypt        = true
   }
   ```

   Henceforth, Terraform will also read this newly-created backend definition
   file.

1. `terraform init -force-copy`. Terraform detects that you want to move your
   Terraform state to the S3 backend, and it does so per `-auto-approve`. Now the
   state is stored in the S3 bucket, and the DynamoDB table will be used to lock
   the state to prevent concurrent modification.

This concludes the one-time preparation. Now you can extend and modify your
Terraform configuration as usual.
