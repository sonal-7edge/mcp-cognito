#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration state
const configState = {
  useCase: null,
  appType: null,
  authMethod: null,
  mfaConfig: null,
  passwordPolicy: null,
  advancedSecurity: null,
  emailConfig: null,
  appClient: null,
  domain: null,
  customAttributes: [],
  lambdaTriggers: [],
  multiTenant: null,
};

// Server instance
const server = new Server(
  {
    name: "cognito-config-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "save_config",
        description: "Save a configuration section for the Cognito User Pool",
        inputSchema: {
          type: "object",
          properties: {
            section: {
              type: "string",
              enum: [
                "useCase",
                "appType",
                "authMethod",
                "mfaConfig",
                "passwordPolicy",
                "advancedSecurity",
                "emailConfig",
                "appClient",
                "domain",
                "customAttributes",
                "lambdaTriggers",
                "multiTenant",
              ],
              description: "Configuration section to save",
            },
            data: {
              type: "object",
              description: "Configuration data for the section",
            },
          },
          required: ["section", "data"],
        },
      },
      {
        name: "get_config",
        description: "Retrieve current configuration state",
        inputSchema: {
          type: "object",
          properties: {
            section: {
              type: "string",
              description: "Specific section to retrieve, or omit for all",
            },
          },
        },
      },
      {
        name: "generate_cloudformation",
        description: "Generate CloudFormation template from current configuration",
        inputSchema: {
          type: "object",
          properties: {
            stackName: {
              type: "string",
              description: "Name for the CloudFormation stack",
            },
          },
          required: ["stackName"],
        },
      },
      {
        name: "reset_config",
        description: "Reset configuration state to start over",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "validate_config",
        description: "Validate current configuration for completeness and correctness",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "save_config": {
        const { section, data } = args;
        configState[section] = data;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: `Configuration section '${section}' saved successfully`,
                currentState: configState,
              }, null, 2),
            },
          ],
        };
      }

      case "get_config": {
        const { section } = args;
        const result = section ? configState[section] : configState;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "generate_cloudformation": {
        const { stackName } = args;
        const template = generateCloudFormationTemplate(stackName, configState);
        
        // Determine the output path - go up to project root and write to resources/
        const projectRoot = join(__dirname, '..', '..');
        const resourcesDir = join(projectRoot, 'resources');
        const outputPath = join(resourcesDir, 'cognito-stack.yaml');
        
        // Create resources directory if it doesn't exist
        try {
          mkdirSync(resourcesDir, { recursive: true });
        } catch (err) {
          // Directory might already exist
        }
        
        // Write the CloudFormation template to file
        try {
          writeFileSync(outputPath, template, 'utf8');
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  message: `CloudFormation template generated successfully`,
                  outputPath: outputPath,
                  template: template
                }, null, 2),
              },
            ],
          };
        } catch (err) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: `Failed to write template: ${err.message}`,
                  template: template
                }, null, 2),
              },
            ],
          };
        }
      }

      case "reset_config": {
        Object.keys(configState).forEach((key) => {
          configState[key] = Array.isArray(configState[key]) ? [] : null;
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: "Configuration reset successfully",
              }, null, 2),
            },
          ],
        };
      }

      case "validate_config": {
        const validation = validateConfiguration(configState);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(validation, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: error.message,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Helper function to generate CloudFormation template
function generateCloudFormationTemplate(stackName, config) {
  const template = {
    AWSTemplateFormatVersion: "2010-09-09",
    Description: `Cognito User Pool configuration for ${config.useCase?.description || 'application'}`,
    Parameters: {
      Environment: {
        Type: "String",
        Default: "dev",
        AllowedValues: ["dev", "staging", "prod"],
        Description: "Environment name",
      },
    },
    Resources: {},
    Outputs: {},
  };

  // User Pool
  const userPool = {
    Type: "AWS::Cognito::UserPool",
    Properties: {
      UserPoolName: `${stackName}-\${Environment}`,
      UsernameConfiguration: {
        CaseSensitive: false,
      },
    },
  };

  // Auth method configuration
  if (config.authMethod) {
    userPool.Properties.UsernameAttributes = config.authMethod.usernameAttributes || [];
    userPool.Properties.AliasAttributes = config.authMethod.aliasAttributes || [];
  }

  // MFA configuration
  if (config.mfaConfig) {
    userPool.Properties.MfaConfiguration = config.mfaConfig.mode || "OFF";
    if (config.mfaConfig.mode !== "OFF") {
      userPool.Properties.EnabledMfas = config.mfaConfig.methods || ["SOFTWARE_TOKEN_MFA"];
    }
  }

  // Password policy
  if (config.passwordPolicy) {
    userPool.Properties.Policies = {
      PasswordPolicy: {
        MinimumLength: config.passwordPolicy.minimumLength || 12,
        RequireUppercase: config.passwordPolicy.requireUppercase !== false,
        RequireLowercase: config.passwordPolicy.requireLowercase !== false,
        RequireNumbers: config.passwordPolicy.requireNumbers !== false,
        RequireSymbols: config.passwordPolicy.requireSymbols !== false,
        TemporaryPasswordValidityDays: config.passwordPolicy.tempPasswordValidity || 7,
      },
    };
  }

  // Advanced security
  if (config.advancedSecurity) {
    userPool.Properties.UserPoolAddOns = {
      AdvancedSecurityMode: config.advancedSecurity.mode || "OFF",
    };
  }

  // Email configuration
  if (config.emailConfig) {
    if (config.emailConfig.type === "SES") {
      userPool.Properties.EmailConfiguration = {
        EmailSendingAccount: "DEVELOPER",
        SourceArn: config.emailConfig.sesSourceArn,
        From: config.emailConfig.fromEmail,
        ReplyToEmailAddress: config.emailConfig.replyToEmail,
      };
    } else {
      userPool.Properties.EmailConfiguration = {
        EmailSendingAccount: "COGNITO_DEFAULT",
      };
    }
  }

  // Custom attributes
  if (config.customAttributes && config.customAttributes.length > 0) {
    userPool.Properties.Schema = config.customAttributes.map((attr) => ({
      Name: attr.name,
      AttributeDataType: attr.dataType || "String",
      Mutable: attr.mutable !== false,
      Required: attr.required === true,
    }));
  }

  // Lambda triggers
  if (config.lambdaTriggers && config.lambdaTriggers.length > 0) {
    userPool.Properties.LambdaConfig = {};
    config.lambdaTriggers.forEach((trigger) => {
      userPool.Properties.LambdaConfig[trigger.type] = trigger.lambdaArn;
    });
  }

  template.Resources.UserPool = userPool;

  // App Client
  if (config.appClient) {
    template.Resources.UserPoolClient = {
      Type: "AWS::Cognito::UserPoolClient",
      Properties: {
        ClientName: config.appClient.name || `${stackName}-client`,
        UserPoolId: { Ref: "UserPool" },
        GenerateSecret: config.appClient.generateSecret === true,
        RefreshTokenValidity: config.appClient.refreshTokenValidity || 30,
        AccessTokenValidity: config.appClient.accessTokenValidity || 1,
        IdTokenValidity: config.appClient.idTokenValidity || 1,
        TokenValidityUnits: {
          RefreshToken: "days",
          AccessToken: "hours",
          IdToken: "hours",
        },
        ExplicitAuthFlows: config.appClient.authFlows || [
          "ALLOW_USER_SRP_AUTH",
          "ALLOW_REFRESH_TOKEN_AUTH",
        ],
        PreventUserExistenceErrors: "ENABLED",
        EnableTokenRevocation: true,
      },
    };

    if (config.appClient.callbackUrls) {
      template.Resources.UserPoolClient.Properties.CallbackURLs = config.appClient.callbackUrls;
    }
    if (config.appClient.logoutUrls) {
      template.Resources.UserPoolClient.Properties.LogoutURLs = config.appClient.logoutUrls;
    }
  }

  // Domain
  if (config.domain) {
    template.Resources.UserPoolDomain = {
      Type: "AWS::Cognito::UserPoolDomain",
      Properties: {
        Domain: config.domain.prefix,
        UserPoolId: { Ref: "UserPool" },
      },
    };

    if (config.domain.customDomain) {
      template.Resources.UserPoolDomain.Properties.CustomDomainConfig = {
        CertificateArn: config.domain.certificateArn,
      };
    }
  }

  // Outputs
  template.Outputs.UserPoolId = {
    Description: "Cognito User Pool ID",
    Value: { Ref: "UserPool" },
    Export: { Name: `\${AWS::StackName}-UserPoolId` },
  };

  template.Outputs.UserPoolArn = {
    Description: "Cognito User Pool ARN",
    Value: { "Fn::GetAtt": ["UserPool", "Arn"] },
    Export: { Name: `\${AWS::StackName}-UserPoolArn` },
  };

  if (config.appClient) {
    template.Outputs.UserPoolClientId = {
      Description: "Cognito User Pool Client ID",
      Value: { Ref: "UserPoolClient" },
      Export: { Name: `\${AWS::StackName}-UserPoolClientId` },
    };
  }

  if (config.domain) {
    template.Outputs.CognitoDomain = {
      Description: "Cognito Hosted UI Domain",
      Value: { Ref: "UserPoolDomain" },
      Export: { Name: `\${AWS::StackName}-CognitoDomain` },
    };
  }

  return JSON.stringify(template, null, 2);
}

// Helper function to validate configuration
function validateConfiguration(config) {
  const errors = [];
  const warnings = [];

  if (!config.useCase) {
    errors.push("Use case not defined");
  }

  if (!config.authMethod) {
    errors.push("Authentication method not configured");
  }

  if (!config.passwordPolicy) {
    warnings.push("Password policy not configured - defaults will be used");
  }

  if (config.mfaConfig?.mode === "OFF" && config.useCase?.type === "production") {
    warnings.push("MFA is disabled for a production use case - consider enabling");
  }

  if (config.passwordPolicy?.minimumLength < 12) {
    warnings.push("Password minimum length is less than 12 characters - consider increasing");
  }

  if (!config.emailConfig) {
    warnings.push("Email configuration not set - Cognito default will be used (50 emails/day limit)");
  }

  if (!config.appClient) {
    errors.push("App client not configured");
  }

  if (config.advancedSecurity?.mode === "OFF") {
    warnings.push("Advanced security is disabled - consider enabling for production");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    completeness: calculateCompleteness(config),
  };
}

function calculateCompleteness(config) {
  const sections = [
    "useCase",
    "authMethod",
    "mfaConfig",
    "passwordPolicy",
    "advancedSecurity",
    "emailConfig",
    "appClient",
    "domain",
  ];

  const completed = sections.filter((section) => config[section] !== null).length;
  return Math.round((completed / sections.length) * 100);
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Cognito Configuration MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
