variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "us-west-2"
}


variable "openai_api_key_ssm_param_name" {
  description = "The name of the AWS Systems Manager Parameter Store parameter for the OpenAI API key."
  type        = string
  default     = "/vectra/openai_api_key"
}



variable "ec2_instance_type" {
  description = "EC2 instance type for the application and Qdrant."
  type        = string
  default     = "t2.small"
}


variable "git_repo_url" {
  description = "HTTPS URL of the Git repository to clone."
  type        = string
  default     = "https://github.com/JY20/eunoia.git"
}

variable "ec2_ami_id_ssm_parameter_name" {
  description = "The AWS Systems Manager Parameter Store name for the EC2 AMI ID (e.g., /aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2)."
  type        = string
  # Example: /aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2 for latest Amazon Linux 2
  # default     = "/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2"
}
