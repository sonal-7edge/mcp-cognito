# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Kiro IDE                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Chat Interface                          │  │
│  │  Developer: "Configure Cognito for my web app"            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Kiro Agent (with Steering)                   │  │
│  │  - Reads: .kiro/steering/cognito-agent-instructions.md   │  │
│  │  - Follows conversational flow                            │  │
│  │  - Validates configuration                                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    ▼                   ▼                         │
│  ┌─────────────────────────┐  ┌──────────────────────────┐     │
│  │   AWS MCP Server        │  │  Cognito Config MCP      │     │
│  │   (aws-docs)            │  │  (cognito-config)        │     │
│  │                         │  │                          │     │
│  │  - AWS Documentation    │  │  - save_config()         │     │
│  │  - Cognito Q&A          │  │  - get_config()          │     │
│  │  - Best practices       │  │  - validate_config()     │     │
│  │                         │  │  - generate_cloudformation()│  │
│  └─────────────────────────┘  └──────────────────────────┘     │
│                                         │                        │
└─────────────────────────────────────────┼────────────────────────┘
                                          ▼
                              ┌───────────────────────┐
                              │  Configuration State  │
                              │  (in-memory)          │
                              │                       │
                              │  - useCase            │
                              │  - authMethod         │
                              │  - mfaConfig          │
                              │  - passwordPolicy     │
                              │  - advancedSecurity   │
                              │  - emailConfig        │
                              │  - appClient          │
                              │  - domain             │
                              │  - customAttributes   │
                              │  - lambdaTriggers     │
                              │  - multiTenant        │
                              └───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │  Generated Outputs    │
                              │                       │
                              │  1. cloudformation-   │
                              │     template.yaml     │
                              │  2. configuration-    │
                              │     summary.md        │
                              │  3. deployment-       │
                              │     guide.md          │
                              └───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │   AWS CloudFormation  │
                              │                       │
                              │  Deploy to AWS        │
                              │  - Cognito User Pool  │
                              │  - App Client         │
                              │  - Domain             │
                              └───────────────────────┘
```

## Component Interaction Flow

### 1. Configuration Phase

```
Developer → Kiro Chat → Agent (with Steering) → MCP Servers
                                                      │
                                                      ▼
                                            Save configuration
                                            to in-memory state
```

### 2. Question & Answer Phase

```
Developer Question → Kiro Agent → AWS MCP Server
                                        │
                                        ▼
                                  AWS Documentation
                                        │
                                        ▼
                                  Answer to Developer
```

### 3. Generation Phase

```
Developer: "Generate template" → Kiro Agent → Cognito Config MCP
                                                      │
                                                      ▼
                                              validate_config()
                                                      │
                                                      ▼
                                          generate_cloudformation()
                                                      │
                                                      ▼
                                              Output files created
```

## File Structure

```
cognito-mcp/
│
├── Configuration & Setup
│   ├── package.json                    # Node.js dependencies
│   ├── install.sh                      # Installation script
│   └── .gitignore                      # Git ignore rules
│
├── Documentation
│   ├── README.md                       # Complete documentation
│   ├── QUICKSTART.md                   # Quick start guide
│   ├── GETTING-STARTED.md              # Step-by-step guide
│   ├── PROJECT-SUMMARY.md              # Project overview
│   ├── ARCHITECTURE.md                 # This file
│   └── example-conversation.md         # Full example
│
├── MCP Server
│   └── server.js                       # Local MCP server implementation
│
├── Kiro Integration
│   └── .kiro/
│       └── steering/
│           └── cognito-agent-instructions.md  # Agent behavior
│
├── Templates & Examples
│   └── templates/
│       ├── web-app-template.yaml       # Pre-built CloudFormation
│       └── deployment-example.sh       # Deployment script
│
└── Generated Output (created during use)
    └── output/
        ├── cloudformation-template.yaml
        ├── configuration-summary.md
        ├── deployment-guide.md
        └── stack-outputs.json
```

## Data Flow

### Configuration State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    Configuration State                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Phase 1: Discovery                                         │
│  ├── useCase: { type, description, scale }                 │
│  └── appType: "web" | "mobile" | "api" | "multi"          │
│                                                              │
│  Phase 2: Authentication                                    │
│  ├── authMethod: {                                          │
│  │     usernameAttributes: ["email"],                      │
│  │     aliasAttributes: []                                 │
│  │   }                                                      │
│  └── customAttributes: [                                    │
│        { name, dataType, mutable, required }               │
│      ]                                                      │
│                                                              │
│  Phase 3: Security                                          │
│  ├── mfaConfig: {                                           │
│  │     mode: "OFF" | "OPTIONAL" | "REQUIRED",             │
│  │     methods: ["SMS_MFA", "SOFTWARE_TOKEN_MFA"]         │
│  │   }                                                      │
│  ├── passwordPolicy: {                                      │
│  │     minimumLength: 12,                                  │
│  │     requireUppercase: true,                             │
│  │     requireLowercase: true,                             │
│  │     requireNumbers: true,                               │
│  │     requireSymbols: true,                               │
│  │     tempPasswordValidity: 7                             │
│  │   }                                                      │
│  └── advancedSecurity: {                                    │
│        mode: "OFF" | "AUDIT" | "ENFORCED",                │
│        deviceTracking: "OFF" | "ALWAYS" | "USER_OPT_IN"   │
│      }                                                      │
│                                                              │
│  Phase 4: Account Management                                │
│  └── emailConfig: {                                         │
│        type: "COGNITO_DEFAULT" | "SES",                    │
│        fromEmail: "noreply@example.com",                   │
│        replyToEmail: "support@example.com",                │
│        sesSourceArn: "arn:aws:ses:..."                     │
│      }                                                      │
│                                                              │
│  Phase 5: Application Integration                           │
│  ├── appClient: {                                           │
│  │     name: "my-app-client",                              │
│  │     authFlows: ["ALLOW_USER_SRP_AUTH", ...],           │
│  │     callbackUrls: ["https://..."],                      │
│  │     logoutUrls: ["https://..."],                        │
│  │     accessTokenValidity: 1,                             │
│  │     idTokenValidity: 1,                                 │
│  │     refreshTokenValidity: 30                            │
│  │   }                                                      │
│  └── domain: {                                              │
│        prefix: "myapp",                                     │
│        customDomain: false                                  │
│      }                                                      │
│                                                              │
│  Phase 6: Advanced Features                                 │
│  ├── lambdaTriggers: [                                      │
│  │     { type: "PreSignUp", lambdaArn: "..." }            │
│  │   ]                                                      │
│  └── multiTenant: {                                         │
│        strategy: "app-client" | "user-pool" | "attribute", │
│        attributes: ["tenant_id", "role"]                   │
│      }                                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## MCP Server Tools

### Cognito Config MCP Server

```javascript
Tools:
├── save_config(section, data)
│   └── Saves configuration section to state
│
├── get_config(section?)
│   └── Retrieves current configuration
│
├── validate_config()
│   └── Validates completeness and correctness
│       ├── Checks required fields
│       ├── Validates security settings
│       └── Returns errors and warnings
│
├── generate_cloudformation(stackName)
│   └── Generates CloudFormation template
│       ├── User Pool resource
│       ├── App Client resource
│       ├── Domain resource
│       └── Outputs
│
└── reset_config()
    └── Clears all configuration state
```

## Conversation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Conversation Phases                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Phase 1: Discovery (3-4 questions)                         │
│  ├── Application type                                       │
│  ├── Use case                                               │
│  └── Expected scale                                         │
│                                                              │
│  Phase 2: Authentication (2-3 questions)                    │
│  ├── Authentication method                                  │
│  └── User attributes                                        │
│                                                              │
│  Phase 3: Security (4-5 questions)                          │
│  ├── MFA configuration                                      │
│  ├── Password policy                                        │
│  ├── Advanced security                                      │
│  └── Device tracking                                        │
│                                                              │
│  Phase 4: Account Management (2-3 questions)                │
│  ├── Email configuration                                    │
│  └── Account recovery                                       │
│                                                              │
│  Phase 5: Application Integration (3-4 questions)           │
│  ├── App client settings                                    │
│  ├── OAuth flows                                            │
│  ├── Token expiration                                       │
│  └── Domain configuration                                   │
│                                                              │
│  Phase 6: Advanced Features (optional)                      │
│  ├── Custom attributes                                      │
│  ├── Lambda triggers                                        │
│  └── Multi-tenant setup                                     │
│                                                              │
│  Phase 7: Review & Generate                                 │
│  ├── Summarize configuration                                │
│  ├── Confirm with user                                      │
│  └── Generate outputs                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Authentication                                     │
│  ├── Email/Phone/Username verification                      │
│  ├── Password policy enforcement                            │
│  └── Account recovery mechanisms                            │
│                                                              │
│  Layer 2: Multi-Factor Authentication                        │
│  ├── TOTP (Authenticator apps)                              │
│  ├── SMS (Text messages)                                    │
│  └── Optional vs Required enforcement                       │
│                                                              │
│  Layer 3: Advanced Security                                  │
│  ├── Compromised credentials check                          │
│  ├── Adaptive authentication (risk-based)                   │
│  ├── IP-based risk detection                                │
│  └── Device fingerprinting                                  │
│                                                              │
│  Layer 4: Token Security                                     │
│  ├── Short-lived access tokens (1 hour)                     │
│  ├── Refresh token rotation                                 │
│  ├── Token revocation                                       │
│  └── PKCE for public clients                                │
│                                                              │
│  Layer 5: Application Security                              │
│  ├── OAuth 2.0 flows                                        │
│  ├── Callback URL validation                                │
│  ├── CORS configuration                                     │
│  └── Client secret management                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Flow                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Configuration                                            │
│     └── Interactive conversation with Kiro                   │
│                                                              │
│  2. Generation                                               │
│     ├── CloudFormation template                             │
│     ├── Configuration summary                               │
│     └── Deployment guide                                    │
│                                                              │
│  3. Validation                                               │
│     ├── Template syntax validation                          │
│     ├── Security best practices check                       │
│     └── Configuration completeness                          │
│                                                              │
│  4. Development Deployment                                   │
│     ├── Deploy to dev environment                           │
│     ├── Test authentication flows                           │
│     └── Verify integrations                                 │
│                                                              │
│  5. Staging Deployment                                       │
│     ├── Deploy to staging                                   │
│     ├── Load testing                                        │
│     └── Security testing                                    │
│                                                              │
│  6. Production Deployment                                    │
│     ├── Deploy to production                                │
│     ├── Monitor CloudWatch logs                             │
│     ├── Set up alarms                                       │
│     └── Document endpoints                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                    External Integrations                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  AWS Services                                                │
│  ├── Cognito User Pools (core)                              │
│  ├── SES (email delivery)                                   │
│  ├── Lambda (triggers)                                      │
│  ├── CloudFormation (deployment)                            │
│  ├── CloudWatch (monitoring)                                │
│  ├── ACM (custom domains)                                   │
│  └── Route 53 (DNS for custom domains)                      │
│                                                              │
│  Application Integration                                     │
│  ├── OAuth 2.0 endpoints                                    │
│  ├── OIDC discovery                                         │
│  ├── JWT token validation                                   │
│  └── User management APIs                                   │
│                                                              │
│  Development Tools                                           │
│  ├── Kiro IDE (configuration)                               │
│  ├── AWS CLI (deployment)                                   │
│  ├── Git (version control)                                  │
│  └── CI/CD pipelines (automation)                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Extensibility Points

The architecture supports extension at multiple points:

1. **New Templates**: Add templates for different use cases
2. **Additional MCP Tools**: Extend server.js with new tools
3. **Custom Steering**: Modify agent behavior via steering files
4. **Lambda Triggers**: Add pre-built trigger examples
5. **Validation Rules**: Enhance configuration validation
6. **Output Formats**: Generate Terraform, Pulumi, etc.
7. **Integration Guides**: Add framework-specific guides
8. **Testing Tools**: Add automated testing capabilities
