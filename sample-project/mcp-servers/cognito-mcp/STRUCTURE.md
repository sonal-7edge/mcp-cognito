# Project Structure

```
cognito-mcp/
├── README.md                           # Main project documentation
├── START-HERE.md                       # Quick start guide (entry point)
├── install.sh                          # Installation script
├── server.js                           # MCP server implementation
├── package.json                        # Node.js dependencies
├── .gitignore                          # Git ignore rules
│
├── docs/                               # 📚 All documentation
│   ├── INDEX.md                       # Documentation navigation
│   ├── GETTING-STARTED.md             # Detailed setup guide
│   ├── QUICKSTART.md                  # Quick reference
│   ├── ARCHITECTURE.md                # Technical architecture
│   └── PROJECT-SUMMARY.md             # Project overview
│
├── examples/                           # 💡 Example conversations
│   └── example-conversation.md        # Full multi-tenant SaaS example
│
├── templates/                          # 🎯 CloudFormation templates & scripts
│   ├── web-app-template.yaml         # Pre-built CloudFormation template
│   └── deployment-example.sh         # Automated deployment script
│
├── .kiro/                              # ⚙️ Kiro configuration
│   └── steering/
│       └── cognito-agent-instructions.md  # Agent behavior instructions
│
└── output/                             # 📦 Generated files (created during use)
    ├── cloudformation-template.yaml   # Custom generated template
    ├── configuration-summary.md       # Configuration summary
    ├── deployment-guide.md            # Deployment instructions
    └── stack-outputs.json             # AWS stack outputs
```

## File Organization

### Root Level (Clean & Minimal)
- **README.md** - Main documentation with all features
- **START-HERE.md** - Entry point for new users
- **install.sh** - Installation automation
- **server.js** - MCP server code
- **package.json** - Dependencies

### docs/ (All Documentation)
- **INDEX.md** - Navigation hub for all docs
- **GETTING-STARTED.md** - Step-by-step setup (5 minutes)
- **QUICKSTART.md** - Quick reference guide
- **ARCHITECTURE.md** - Technical deep dive
- **PROJECT-SUMMARY.md** - Project overview

### examples/ (Example Conversations)
- **example-conversation.md** - Complete multi-tenant SaaS setup example

### templates/ (CloudFormation & Scripts)
- **web-app-template.yaml** - Production-ready CloudFormation
- **deployment-example.sh** - Deployment automation

### .kiro/ (Kiro Configuration)
- **steering/cognito-agent-instructions.md** - Agent behavior and flow

### output/ (Generated - Not in Git)
- Created automatically during configuration
- Contains generated CloudFormation templates
- Configuration summaries
- Deployment guides

## Navigation Guide

### For New Users
1. Start: **START-HERE.md**
2. Setup: **docs/GETTING-STARTED.md**
3. Example: **examples/example-conversation.md**

### For Quick Reference
1. **docs/QUICKSTART.md**
2. **README.md** → Configuration Sections

### For Deep Understanding
1. **docs/ARCHITECTURE.md**
2. **docs/PROJECT-SUMMARY.md**
3. **server.js** (implementation)

### For Deployment
1. **templates/web-app-template.yaml**
2. **templates/deployment-example.sh**
3. **docs/QUICKSTART.md** → Deployment

## File Count

- **Root**: 6 files (clean!)
- **docs/**: 5 documentation files
- **examples/**: 1 example file
- **templates/**: 2 template files
- **.kiro/**: 1 configuration file
- **Total**: 15 files (organized!)

## Benefits of This Structure

✅ **Clean Root** - Only essential files at root level
✅ **Organized Docs** - All documentation in `docs/`
✅ **Clear Examples** - Examples separated in `examples/`
✅ **Easy Navigation** - Clear folder structure
✅ **Scalable** - Easy to add more docs/examples
✅ **Professional** - Industry-standard organization
