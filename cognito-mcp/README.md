# Cognito Configuration Generator

An interactive tool to help developers configure AWS Cognito User Pools with best practices and security considerations.

## 📁 Project Structure

```
cognito-mcp/
├── README.md                    # This file - project overview
├── START-HERE.md               # Quick start guide
├── install.sh                  # Installation script
├── server.js                   # MCP server implementation
├── package.json                # Dependencies
├── docs/                       # Documentation
│   ├── INDEX.md               # Documentation navigation
│   ├── GETTING-STARTED.md     # Detailed setup guide
│   ├── QUICKSTART.md          # Quick reference
│   ├── ARCHITECTURE.md        # Technical architecture
│   └── PROJECT-SUMMARY.md     # Project overview
├── examples/                   # Example conversations
│   └── example-conversation.md
├── templates/                  # CloudFormation templates
│   ├── web-app-template.yaml
│   └── deployment-example.sh
└── .kiro/                      # Kiro configuration
    └── steering/
        └── cognito-agent-instructions.md
```

## Overview

This tool provides an AI-assisted, conversational approach to generating AWS Cognito CloudFormation templates. It guides you through all configuration options and generates production-ready infrastructure code.

## Features

- **Interactive Configuration**: Conversational interface to gather requirements
- **Security Best Practices**: Guided setup for MFA, password policies, and security features
- **Use Case Driven**: Tailored configurations based on your specific needs
- **CloudFormation Templates**: Production-ready infrastructure as code
- **Comprehensive Documentation**: Detailed explanations of all configuration choices

## Prerequisites

- Kiro IDE installed
- Python package manager (uv/uvx) for MCP servers
- Basic understanding of AWS Cognito concepts
- AWS account for deployment

## Setup Instructions

### Step 1: Install Python Package Manager (uv)

If you don't have `uv` installed, install it using one of these methods:

**macOS/Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows:**
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**Using pip:**
```bash
pip install uv
```

**Using Homebrew (macOS):**
```bash
brew install uv
```

For more installation options, visit: https://docs.astral.sh/uv/getting-started/installation/

### Step 2: Configure AWS MCP Server

1. In Kiro, open the Command Palette (Ctrl/Cmd + Shift + P)
2. Search for "MCP" and select "Open MCP Settings"
3. Or manually create/edit `.kiro/settings/mcp.json` in your workspace

Add the AWS Documentation MCP server:

```json
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Step 3: Configure Cognito Configuration MCP (This Tool)

This local MCP server will be created in this directory to provide interactive Cognito configuration.

Add to your `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": []
    },
    "cognito-config": {
      "command": "node",
      "args": ["cognito-mcp/server.js"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Step 4: Verify MCP Server Connection

1. In Kiro, open the MCP Server view in the Kiro feature panel
2. Check that both "aws-docs" and "cognito-config" servers show as connected
3. If not connected, click "Reconnect" or restart Kiro

### Step 5: Start Using the Tool

Once both MCP servers are configured and connected, you can start a conversation with Kiro in this workspace to configure your Cognito setup.

## Configuration Sections

### 1. Basic Information
- **User Pool Name**: Identifier for your user pool
- **Use Case**: Web app, mobile app, API, or multi-platform
- **Region**: AWS region for deployment

### 2. Authentication Methods
- Email only
- Phone number only
- Email and phone number
- Username
- Custom attributes

### 3. Multi-Factor Authentication (MFA)
- **OFF**: No MFA required
- **OPTIONAL**: Users can enable MFA
- **REQUIRED**: All users must use MFA

MFA Methods:
- SMS text message
- Time-based One-Time Password (TOTP)
- Both SMS and TOTP

### 4. Password Policy
- **Minimum Length**: 8-99 characters (recommended: 12+)
- **Require Uppercase**: A-Z
- **Require Lowercase**: a-z
- **Require Numbers**: 0-9
- **Require Special Characters**: !@#$%^&*
- **Temporary Password Validity**: Days before expiration

### 5. Account Recovery
- Email verification
- Phone number verification
- Admin-only recovery

### 6. User Verification
- Auto-verify email addresses
- Auto-verify phone numbers
- Verification message customization

### 7. Email Configuration
- **Cognito Default**: AWS-managed email (limited)
- **SES Integration**: Higher sending limits, custom domains
- **From Email Address**: Sender email
- **Reply-To Email**: Response address

### 8. Advanced Security Features
- **Advanced Security Mode**: OFF, AUDIT, ENFORCED
- **Compromised Credentials Check**: Block leaked passwords
- **Adaptive Authentication**: Risk-based authentication
- **Device Tracking**: Remember user devices

### 9. User Attributes
- Standard attributes (email, phone, name, etc.)
- Custom attributes (company, role, etc.)
- Required vs optional attributes
- Mutable vs immutable attributes

### 10. App Clients
- Client name and type
- OAuth 2.0 flows (authorization code, implicit, client credentials)
- Callback URLs
- Token expiration settings
- Refresh token rotation

### 11. Triggers (Lambda Functions)
- Pre-signup validation
- Post-confirmation actions
- Pre-authentication checks
- Custom message customization
- User migration

### 12. Domain Configuration
- Cognito domain (prefix.auth.region.amazoncognito.com)
- Custom domain (auth.yourdomain.com)

## Getting Started

**Quick Start**: See [START-HERE.md](START-HERE.md) for a 5-minute setup guide.

**Detailed Guide**: See [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) for step-by-step instructions.

**Quick Reference**: See [docs/QUICKSTART.md](docs/QUICKSTART.md) for quick commands and tips.

### Basic Steps

1. Run `./install.sh` to install dependencies and configure MCP servers
2. Restart Kiro or reconnect MCP servers
3. Start a conversation: "I need to configure Cognito for my web application"
4. Follow the interactive prompts
5. Review and deploy the generated CloudFormation template

## Usage Example

```bash
# In Kiro chat
"I need to set up Cognito for a web application with email authentication"

# Kiro will guide you through:
# - MFA requirements
# - Password policies
# - Email configuration
# - Security features
# - And generate the CloudFormation template
```

## Generated Files

After completing the interactive setup, you'll receive:

1. **cloudformation-template.yaml**: Complete CloudFormation template
2. **configuration-summary.md**: Human-readable summary of choices
3. **deployment-guide.md**: Step-by-step deployment instructions

## Security Recommendations

### Production Environments
- Enable MFA (REQUIRED mode)
- Minimum password length: 12 characters
- Enable all password complexity requirements
- Use Advanced Security Mode: ENFORCED
- Enable compromised credentials check
- Integrate with SES for email delivery
- Use custom domain with SSL certificate
- Enable CloudWatch logging

### Development Environments
- MFA: OPTIONAL or OFF
- Relaxed password policies for testing
- Advanced Security Mode: AUDIT
- Use Cognito default email

## Common Use Cases

### Web Application (SPA)
- Authentication: Email + Password
- MFA: OPTIONAL
- OAuth Flow: Authorization Code with PKCE
- Token expiration: 1 hour access, 30 days refresh

### Mobile Application
- Authentication: Email or Phone + Password
- MFA: REQUIRED
- OAuth Flow: Authorization Code with PKCE
- Device tracking: ALWAYS
- Refresh token rotation: Enabled

### API/Backend Service
- Authentication: Username + Password
- MFA: REQUIRED
- OAuth Flow: Client Credentials
- Custom attributes for roles/permissions

### Multi-tenant SaaS

**Option 1: User Pool Level Isolation (Highest Isolation)**
- Separate User Pool per tenant
- Complete data isolation
- Independent configuration per tenant
- Higher operational overhead
- Best for: Enterprise customers, compliance requirements

**Option 2: App Client Based Isolation (Moderate Isolation)**
- Single User Pool, separate App Client per tenant
- Shared user pool, isolated authentication flows
- Custom attributes: tenant_id, role
- App client-specific OAuth settings
- Pre-signup trigger: Validate tenant and assign app client
- Best for: SaaS with multiple customer tiers

**Option 3: Custom Attributes (Logical Isolation)**
- Single User Pool and App Client
- Custom attributes: tenant_id, role, permissions
- Application-level tenant filtering
- Pre-authentication trigger: Validate tenant access
- Post-confirmation: Provision tenant resources
- Best for: Cost-effective multi-tenancy with application-level controls

## Troubleshooting

### AWS MCP Server Not Available
Ensure your `.kiro/settings/mcp.json` includes:
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
    }
  }
}
```

### Questions During Setup
The AWS MCP server can answer questions about:
- Cognito features and limitations
- Best practices for specific use cases
- AWS service integrations
- Pricing and quotas

## Next Steps

After generating your configuration:
1. Review the CloudFormation template
2. Customize any specific requirements
3. Test in a development environment
4. Deploy to production with appropriate safeguards
5. Configure your application to use the Cognito endpoints

## Documentation

- **[START-HERE.md](START-HERE.md)** - Quick start for new users
- **[docs/INDEX.md](docs/INDEX.md)** - Complete documentation index
- **[docs/GETTING-STARTED.md](docs/GETTING-STARTED.md)** - Detailed setup guide
- **[docs/QUICKSTART.md](docs/QUICKSTART.md)** - Quick reference
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Technical architecture
- **[docs/PROJECT-SUMMARY.md](docs/PROJECT-SUMMARY.md)** - Project overview
- **[examples/example-conversation.md](examples/example-conversation.md)** - Full conversation example

## Support

For questions about:
- **Cognito Features**: Ask Kiro with AWS MCP server enabled
- **CloudFormation**: Refer to AWS CloudFormation documentation
- **This Tool**: Review the documentation in the `docs/` directory

## License

This tool is provided as-is for internal use.
