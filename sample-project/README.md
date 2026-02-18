# Sample Project - Cognito Authentication Setup

This project demonstrates how to configure AWS Cognito authentication using the MCP server.

## Project Structure

```
sample-project/
├── mcp-servers/
│   └── cognito-mcp/          # MCP server for Cognito configuration
├── resources/
│   └── cognito-stack.yaml    # Generated CloudFormation template (created after configuration)
└── README.md
```

## Getting Started

### 1. Configure the MCP Server

The Cognito MCP server is located in `mcp-servers/cognito-mcp/`. All team members can use this server to generate infrastructure configuration.

### 2. Generate CloudFormation Template

When you use the MCP server to configure your Cognito User Pool and generate the CloudFormation template, it will automatically be saved to:

```
resources/cognito-stack.yaml
```

### 3. Deploy the Stack

Once the CloudFormation template is generated, you can deploy it using:

```bash
aws cloudformation deploy \
  --template-file resources/cognito-stack.yaml \
  --stack-name your-stack-name \
  --capabilities CAPABILITY_IAM
```

## MCP Server Usage

The Cognito MCP server provides tools to:
- Configure authentication methods
- Set up MFA policies
- Define password policies
- Configure email settings
- Generate CloudFormation templates

All generated templates will be automatically saved to the `resources/` directory.
