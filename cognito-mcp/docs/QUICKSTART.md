# Quick Start Guide

Get your Cognito configuration up and running in minutes.

## Installation

### 1. Install Dependencies

```bash
cd cognito-mcp
npm install
```

### 2. Configure MCP Servers

Add to your workspace `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false
    },
    "cognito-config": {
      "command": "node",
      "args": ["cognito-mcp/server.js"],
      "disabled": false
    }
  }
}
```

### 3. Verify Connection

1. Open Kiro MCP Server view
2. Check both servers show as "Connected"
3. If not, click "Reconnect"

## Usage

### Interactive Configuration

Start a conversation with Kiro:

```
"I need to configure Cognito for my web application"
```

Kiro will guide you through:
- Application type and use case
- Authentication methods
- MFA settings
- Password policies
- Security features
- Email configuration
- App client setup
- Domain configuration

### Quick Templates

Use pre-built templates for common scenarios:

**Web Application:**
```bash
# Review the template
cat templates/web-app-template.yaml

# Deploy with AWS CLI
aws cloudformation create-stack \
  --stack-name my-app-cognito \
  --template-body file://templates/web-app-template.yaml \
  --parameters \
    ParameterKey=UserPoolName,ParameterValue=my-app \
    ParameterKey=CallbackURL,ParameterValue=https://myapp.com/callback \
    ParameterKey=LogoutURL,ParameterValue=https://myapp.com/logout \
  --capabilities CAPABILITY_IAM
```

## Example Conversation Flow

**You:** "Set up Cognito for a SaaS application with email authentication"

**Kiro:** "I'll help you configure Cognito for your SaaS application. Let me ask a few questions:

1. Will this be a web app, mobile app, or both?"

**You:** "Web application"

**Kiro:** "Great! For a web-based SaaS application, I recommend:
- Email + Password authentication
- Optional MFA (users can enable)
- Strong password policy (12+ characters)
- Advanced security in ENFORCED mode

Does this sound good, or would you like to customize?"

**You:** "That works, but I need required MFA"

**Kiro:** "Perfect! I'll set MFA to REQUIRED. Which MFA methods would you like?
- SMS (costs per message)
- TOTP (authenticator apps like Google Authenticator)
- Both"

...and so on.

## Generated Files

After configuration, you'll get:

1. `output/cloudformation-template.yaml` - Your CloudFormation template
2. `output/configuration-summary.md` - Human-readable summary
3. `output/deployment-guide.md` - Deployment instructions

## Common Commands

### Ask Questions
```
"What's the difference between OPTIONAL and REQUIRED MFA?"
"How do I set up custom domains?"
"What are the SES email limits?"
```

### Modify Configuration
```
"Change MFA to REQUIRED"
"Add a custom attribute for tenant_id"
"Enable device tracking"
```

### Generate Output
```
"Generate the CloudFormation template"
"Show me the configuration summary"
"Create deployment instructions"
```

## Troubleshooting

### MCP Server Not Connected
- Check `uv` is installed: `uv --version`
- Verify mcp.json syntax
- Restart Kiro
- Check MCP Server view for error messages

### AWS MCP Questions Not Working
- Ensure aws-docs server is connected
- Check FASTMCP_LOG_LEVEL in mcp.json
- Try reconnecting the server

### Configuration Not Saving
- Check cognito-config server is running
- Verify Node.js is installed: `node --version`
- Check server.js path in mcp.json

## Next Steps

1. Complete interactive configuration
2. Review generated CloudFormation template
3. Test in development environment
4. Customize for your specific needs
5. Deploy to production

## Support

- AWS Cognito questions: Ask Kiro with AWS MCP enabled
- Configuration help: Use the interactive flow
- Template issues: Check CloudFormation documentation

## Tips

- Start with recommended defaults, customize later
- Use AUDIT mode in dev, ENFORCED in production
- Test MFA flows before requiring for all users
- Set up SES for production email delivery
- Enable CloudWatch logging for monitoring
