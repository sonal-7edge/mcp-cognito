# Cognito Auth Package

A comprehensive, production-ready authentication solution that serves as an alternative to AWS Amplify. This package provides TypeScript Lambda handlers, CloudFormation infrastructure templates, and identity provider integration documentation.

## Overview

The Cognito Auth Package consists of three main components:

1. **TypeScript Authentication Library**: Core Cognito class and utility functions
2. **Lambda Handlers**: Six single-purpose Lambda functions for authentication operations
3. **Infrastructure as Code**: CloudFormation template for complete deployment

## Quick Start

### Prerequisites

- Node.js 20.x or later
- AWS CLI configured with appropriate credentials
- AWS Cognito User Pool and App Client
- S3 bucket for Lambda deployment packages

### Installation

```bash
cd services/Auth
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Package for Deployment

```bash
npm run package
```

### Deploy

```bash
npm run deploy
```

## Project Structure

```
services/Auth/
├── class/              # Core Cognito class
├── utils/              # Utility functions
├── handlers/           # Lambda handlers
├── docs/               # Documentation
├── dist/               # Compiled JavaScript (generated)
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies and scripts
└── jest.config.js      # Testing configuration
```

## Lambda Handlers

- **signup.ts**: User registration
- **verification_code.ts**: Email/phone verification
- **login.ts**: User authentication
- **mfa.ts**: Multi-factor authentication
- **set_new_password.ts**: Password changes
- **reset_password.ts**: Password recovery

## Documentation

See the `docs/` directory for comprehensive documentation:

- API Reference
- Identity Provider Integration Guides
- Deployment Instructions
- Troubleshooting Guide

## License

MIT
