# Cognito MCP Configuration Tool - Documentation Index

Welcome! This index helps you find the right documentation for your needs.

## 🚀 Getting Started

**New to this tool?** Start here:

1. **[GETTING-STARTED.md](GETTING-STARTED.md)** - Your first 5 minutes
   - Installation steps
   - Quick setup
   - First conversation example
   - What to expect

2. **[../install.sh](../install.sh)** - Run this script to install
   ```bash
   cd cognito-mcp
   ./install.sh
   ```

## 📚 Documentation by Purpose

### I want to understand what this tool does
- **[../README.md](../README.md)** - Complete feature documentation
  - All configuration sections explained
  - Security recommendations
  - Common use cases
  - Troubleshooting

- **[PROJECT-SUMMARY.md](PROJECT-SUMMARY.md)** - Project overview
  - Key features
  - Technology stack
  - Components
  - Use cases supported

### I want to start using it quickly
- **[QUICKSTART.md](QUICKSTART.md)** - Quick reference guide
  - Installation in 3 steps
  - Usage examples
  - Common commands
  - Tips and tricks

- **[GETTING-STARTED.md](GETTING-STARTED.md)** - Detailed walkthrough
  - Step-by-step setup
  - What to expect during configuration
  - Example conversations
  - Deployment basics

### I want to see examples
- **[../examples/example-conversation.md](../examples/example-conversation.md)** - Full conversation example
  - Complete multi-tenant SaaS setup
  - All phases of configuration
  - Follow-up questions
  - Real-world scenario

- **[../templates/web-app-template.yaml](../templates/web-app-template.yaml)** - Pre-built template
  - Production-ready CloudFormation
  - Secure defaults
  - Ready to deploy

### I want to understand the architecture
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture
  - System architecture diagram
  - Component interaction flow
  - Data flow
  - Security architecture
  - Deployment pipeline

### I want to deploy
- **[../templates/deployment-example.sh](../templates/deployment-example.sh)** - Deployment script
  - Automated deployment
  - Validation steps
  - Stack management
  - Output capture

## 📖 Documentation by Role

### For Developers (First Time Users)
1. [GETTING-STARTED.md](GETTING-STARTED.md) - Start here
2. [../examples/example-conversation.md](../examples/example-conversation.md) - See how it works
3. [QUICKSTART.md](QUICKSTART.md) - Quick reference
4. Run `../install.sh` and start configuring!

### For Team Leads (Evaluating the Tool)
1. [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) - Overview
2. [../README.md](../README.md) - Features and capabilities
3. [ARCHITECTURE.md](ARCHITECTURE.md) - Technical details
4. [../examples/example-conversation.md](../examples/example-conversation.md) - See it in action

### For DevOps Engineers (Deploying)
1. [../templates/web-app-template.yaml](../templates/web-app-template.yaml) - Template structure
2. [../templates/deployment-example.sh](../templates/deployment-example.sh) - Deployment automation
3. [../README.md](../README.md) - Configuration options
4. [ARCHITECTURE.md](ARCHITECTURE.md) - Integration points

### For Security Engineers (Reviewing)
1. [../README.md](../README.md) - Security recommendations section
2. [ARCHITECTURE.md](ARCHITECTURE.md) - Security architecture
3. [../templates/web-app-template.yaml](../templates/web-app-template.yaml) - Security defaults
4. [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) - Security features

## 🔧 Technical Files

### Configuration
- **[../package.json](../package.json)** - Node.js dependencies
- **[../.gitignore](../.gitignore)** - Git ignore rules
- **[../../.kiro/settings/mcp.json](../../.kiro/settings/mcp.json)** - MCP server configuration (created by install.sh)

### Implementation
- **[../server.js](../server.js)** - MCP server implementation
  - Configuration state management
  - CloudFormation generation
  - Validation logic

### Agent Behavior
- **[../.kiro/steering/cognito-agent-instructions.md](../.kiro/steering/cognito-agent-instructions.md)** - Kiro agent instructions
  - Conversational flow
  - Security recommendations
  - Use case defaults
  - Error handling

## 📋 Quick Reference

### Installation
```bash
cd cognito-mcp
./install.sh
# Restart Kiro or reconnect MCP servers
```

### Start Configuring
In Kiro chat:
```
I need to configure Cognito for my [web/mobile/API] application
```

### Deploy
```bash
./templates/deployment-example.sh
```

### Get Help
In Kiro chat:
```
What's the difference between OPTIONAL and REQUIRED MFA?
How do I set up multi-tenant Cognito?
Show me the best password policy settings
```

## 🎯 Common Tasks

| Task | Documentation |
|------|---------------|
| Install the tool | [GETTING-STARTED.md](GETTING-STARTED.md) → Step 1 |
| Configure Cognito | [QUICKSTART.md](QUICKSTART.md) → Usage |
| Understand MFA options | [../README.md](../README.md) → Section 3 |
| Set up multi-tenant | [../README.md](../README.md) → Multi-tenant SaaS |
| Deploy to AWS | [../templates/deployment-example.sh](../templates/deployment-example.sh) |
| See full example | [../examples/example-conversation.md](../examples/example-conversation.md) |
| Troubleshoot issues | [../README.md](../README.md) → Troubleshooting |
| Understand architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |

## 🔍 Find Information By Topic

### Authentication
- [../README.md](../README.md) → Section 2: Authentication Methods
- [../examples/example-conversation.md](../examples/example-conversation.md) → Authentication Method

### Multi-Factor Authentication (MFA)
- [../README.md](../README.md) → Section 3: Multi-Factor Authentication
- [GETTING-STARTED.md](GETTING-STARTED.md) → What to Expect → Security

### Password Policies
- [../README.md](../README.md) → Section 4: Password Policy
- [../templates/web-app-template.yaml](../templates/web-app-template.yaml) → PasswordPolicy

### Security Features
- [../README.md](../README.md) → Section 8: Advanced Security Features
- [ARCHITECTURE.md](ARCHITECTURE.md) → Security Architecture
- [../README.md](../README.md) → Security Recommendations

### Multi-Tenant Setup
- [../README.md](../README.md) → Multi-tenant SaaS (3 strategies)
- [../examples/example-conversation.md](../examples/example-conversation.md) → Multi-tenant Strategy
- [ARCHITECTURE.md](ARCHITECTURE.md) → Multi-Tenant section

### Email Configuration
- [../README.md](../README.md) → Section 7: Email Configuration
- [../examples/example-conversation.md](../examples/example-conversation.md) → Email Configuration

### App Client Setup
- [../README.md](../README.md) → Section 10: App Clients
- [../templates/web-app-template.yaml](../templates/web-app-template.yaml) → UserPoolClient

### Lambda Triggers
- [../README.md](../README.md) → Section 11: Triggers
- [../examples/example-conversation.md](../examples/example-conversation.md) → Lambda Triggers

### Custom Domains
- [../README.md](../README.md) → Section 12: Domain Configuration
- [../examples/example-conversation.md](../examples/example-conversation.md) → Domain Configuration

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| MCP servers not connecting | [../README.md](../README.md) → Troubleshooting |
| Installation fails | [GETTING-STARTED.md](GETTING-STARTED.md) → Troubleshooting |
| Configuration questions | Ask Kiro with AWS MCP enabled |
| Deployment errors | [../templates/deployment-example.sh](../templates/deployment-example.sh) |
| Understanding features | [../README.md](../README.md) → Configuration Sections |

## 📞 Getting Help

1. **During Configuration**: Ask Kiro questions directly
   - "What's the best MFA setting for production?"
   - "How do I configure SES?"
   - "Explain password policy options"

2. **AWS Cognito Questions**: AWS MCP server provides answers
   - Cognito features and limitations
   - Best practices
   - Service integrations

3. **Tool Usage**: Check documentation
   - [QUICKSTART.md](QUICKSTART.md) for quick answers
   - [../README.md](../README.md) for detailed information
   - [../examples/example-conversation.md](../examples/example-conversation.md) for examples

## 🎓 Learning Path

### Beginner
1. Read [GETTING-STARTED.md](GETTING-STARTED.md)
2. Run `../install.sh`
3. Follow [QUICKSTART.md](QUICKSTART.md)
4. Try a simple web app configuration

### Intermediate
1. Review [../README.md](../README.md) for all options
2. Study [../examples/example-conversation.md](../examples/example-conversation.md)
3. Configure a production setup
4. Deploy using [../templates/deployment-example.sh](../templates/deployment-example.sh)

### Advanced
1. Read [ARCHITECTURE.md](ARCHITECTURE.md)
2. Customize [../.kiro/steering/cognito-agent-instructions.md](../.kiro/steering/cognito-agent-instructions.md)
3. Extend [../server.js](../server.js) with new tools
4. Create custom templates

## 📝 Contributing

To extend this tool:
1. Review [ARCHITECTURE.md](ARCHITECTURE.md) → Extensibility Points
2. Modify [../server.js](../server.js) for new MCP tools
3. Update [../.kiro/steering/cognito-agent-instructions.md](../.kiro/steering/cognito-agent-instructions.md) for behavior changes
4. Add templates in [../templates/](../templates/)
5. Update documentation

## 📄 File Summary

| File | Purpose | When to Read |
|------|---------|--------------|
| INDEX.md | This file - navigation | Start here |
| GETTING-STARTED.md | First-time setup | Installing |
| QUICKSTART.md | Quick reference | Need quick info |
| ../README.md | Complete documentation | Understanding features |
| PROJECT-SUMMARY.md | Project overview | Evaluating tool |
| ARCHITECTURE.md | Technical architecture | Deep dive |
| ../examples/example-conversation.md | Full example | Seeing it work |
| ../install.sh | Installation script | Setting up |
| ../server.js | MCP server code | Extending tool |
| ../package.json | Dependencies | Development |
| ../.kiro/steering/... | Agent instructions | Customizing behavior |
| ../templates/*.yaml | CloudFormation templates | Deployment |
| ../templates/*.sh | Deployment scripts | Automating deployment |

---

**Ready to start?** → [GETTING-STARTED.md](GETTING-STARTED.md)

**Need quick help?** → [QUICKSTART.md](QUICKSTART.md)

**Want to see it in action?** → [../examples/example-conversation.md](../examples/example-conversation.md)
