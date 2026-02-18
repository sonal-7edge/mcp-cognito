# Getting Started with Cognito MCP Configuration Tool

Welcome! This tool helps you configure AWS Cognito User Pools through an interactive, conversational interface in Kiro IDE.

## What You'll Build

A production-ready AWS Cognito User Pool with:
- Secure authentication (email/phone/username)
- Multi-factor authentication (MFA)
- Strong password policies
- Advanced security features
- CloudFormation infrastructure code
- Complete documentation

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd cognito-mcp
./install.sh
```

This will:
- Check for Node.js and uv
- Install npm dependencies
- Create MCP configuration
- Set up the tool

### 2. Restart Kiro

After installation, restart Kiro or reconnect MCP servers:
1. Open Command Palette (Ctrl/Cmd + Shift + P)
2. Search for "MCP"
3. Select "Reconnect MCP Servers"

### 3. Verify Connection

1. Open Kiro's MCP Server view (in the Kiro feature panel)
2. Check that both servers show as "Connected":
   - ✅ aws-docs
   - ✅ cognito-config

### 4. Start Configuring

In Kiro chat, type:

```
I need to configure Cognito for my web application
```

Kiro will guide you through the entire configuration process!

## What to Expect

The tool will ask you about:

1. **Your Application** (2-3 questions)
   - Type: web, mobile, API, or multi-platform
   - Use case: SaaS, internal, customer-facing
   - Expected scale

2. **Authentication** (2-3 questions)
   - Method: email, phone, username
   - User attributes needed
   - Verification preferences

3. **Security** (4-5 questions)
   - MFA: OFF, OPTIONAL, or REQUIRED
   - Password policy requirements
   - Advanced security features
   - Device tracking

4. **Email & Recovery** (2-3 questions)
   - Email provider: Cognito default or SES
   - Account recovery options
   - Email addresses

5. **App Integration** (3-4 questions)
   - OAuth flows
   - Token expiration
   - Callback URLs
   - Domain configuration

6. **Advanced Features** (optional)
   - Custom attributes
   - Lambda triggers
   - Multi-tenant setup

Total time: 5-10 minutes

## Example Conversation

**You:** "Set up Cognito for a web app with email authentication"

**Kiro:** "I'll help you configure Cognito for your web application. Is this a single-page application (SPA) or traditional web app?"

**You:** "SPA built with React"

**Kiro:** "Perfect! For a React SPA, I recommend Authorization Code flow with PKCE. Would you like MFA to be OFF, OPTIONAL, or REQUIRED?"

...and so on!

## What You'll Get

After completing the configuration, you'll receive:

1. **cloudformation-template.yaml**
   - Complete, deployable infrastructure code
   - Parameterized for dev/staging/prod
   - Ready to deploy with AWS CLI or Console

2. **configuration-summary.md**
   - Human-readable summary of all choices
   - Rationale for each decision
   - Security implications explained

3. **deployment-guide.md**
   - Step-by-step deployment instructions
   - AWS CLI commands
   - Verification steps
   - Troubleshooting tips

## Deployment

After generating your configuration:

```bash
# Deploy using the example script
cd cognito-mcp
./templates/deployment-example.sh

# Or manually with AWS CLI
aws cloudformation create-stack \
  --stack-name my-app-cognito \
  --template-body file://output/cloudformation-template.yaml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  --capabilities CAPABILITY_IAM
```

## Common Use Cases

### Web Application
```
"Configure Cognito for my React web app with email authentication"
```
Result: Email + password, OPTIONAL MFA, PKCE flow, 1h tokens

### Mobile App
```
"Set up Cognito for my iOS app with phone authentication"
```
Result: Phone + password, REQUIRED MFA, device tracking, 30d refresh tokens

### Multi-tenant SaaS
```
"I need Cognito for a multi-tenant SaaS application"
```
Result: App client isolation, tenant_id attribute, pre-signup validation

### API Service
```
"Configure Cognito for service-to-service authentication"
```
Result: Client credentials flow, service attributes, no MFA

## Getting Help

### During Configuration
Ask Kiro questions anytime:
- "What's the difference between OPTIONAL and REQUIRED MFA?"
- "Should I use Cognito default or SES for email?"
- "What are the best password policy settings?"

The AWS MCP server will provide accurate, up-to-date answers.

### After Configuration
- Review the generated `configuration-summary.md`
- Check `deployment-guide.md` for deployment steps
- See `example-conversation.md` for a complete example

### Troubleshooting

**MCP servers not connecting?**
- Check `uv --version` and `node --version`
- Verify `.kiro/settings/mcp.json` syntax
- Restart Kiro
- Check MCP Server view for errors

**Configuration not saving?**
- Ensure cognito-config server is running
- Check server.js path in mcp.json
- Look for errors in Kiro's output panel

**AWS questions not working?**
- Verify aws-docs server is connected
- Check FASTMCP_LOG_LEVEL in mcp.json
- Try reconnecting the server

## Tips for Success

✅ **Start with defaults** - The tool recommends secure defaults, customize later
✅ **Ask questions** - Use the AWS MCP server for clarification
✅ **Test in dev first** - Deploy to development environment before production
✅ **Use SES for production** - Cognito default email has low limits
✅ **Enable MFA** - At least OPTIONAL for production applications
✅ **Strong passwords** - Minimum 12 characters with complexity
✅ **Advanced security** - Use ENFORCED mode in production

## Next Steps

After your first configuration:

1. ✅ Deploy to development environment
2. ✅ Test authentication flow
3. ✅ Integrate with your application
4. ✅ Set up SES if using custom email
5. ✅ Add Lambda triggers if needed
6. ✅ Configure custom domain (optional)
7. ✅ Deploy to production

## Learn More

- **README.md** - Complete feature documentation
- **QUICKSTART.md** - Quick reference guide
- **example-conversation.md** - Full conversation example
- **PROJECT-SUMMARY.md** - Technical architecture
- **AWS Cognito Docs** - Ask Kiro with AWS MCP enabled

## Support

Need help? Ask Kiro:
- "How do I configure custom domains?"
- "What's the best multi-tenant strategy?"
- "Show me how to add Lambda triggers"
- "Explain the difference between access and refresh tokens"

The tool is designed to guide you every step of the way!

---

Ready to start? Run `./install.sh` and begin your conversation with Kiro!
