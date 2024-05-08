
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-west-1"
}


variable "http_subscription_url" {
  type = string
  description = "The URL to subscribe to the SNS topic"
  default = "https://1f9f-54-215-90-61.ngrok-free.app/api/sns-subscriber"
  
}

resource "aws_sns_topic" "my_topic" {
  name = "my-sns-topic"  # Name your SNS topic
}

resource "aws_sns_topic_subscription" "my_https_subscription" {
  topic_arn = aws_sns_topic.my_topic.arn
  protocol  = "https"
  endpoint  = var.http_subscription_url
}

resource "aws_s3_bucket" "cloudformation_template" {
  bucket = "pix.cloudformation.template"
}



resource "aws_s3_object" "cloudformation_template" {
  bucket = aws_s3_bucket.cloudformation_template.bucket
  key    = "cloudformation.yaml"
  source = "./cf.yml"

  # The filemd5() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the md5() function and the file() function:
  # etag = "${md5(file("path/to/file"))}"
  etag = filemd5("./cf.yml")
  acl = "public-read"
}

# output the topic ARN
output "sns_topic_arn" {
  value = aws_sns_topic.my_topic.arn
}

# output http link to cloudformation template
output "cloudformation_template_link" {
  # https://s3.us-west-1.amazonaws.com/pix.cloudformation.template/cloudformation.yaml
  value = "https://s3.us-west-1.amazonaws.com/${aws_s3_bucket.cloudformation_template.bucket}/cloudformation.yaml"
}
