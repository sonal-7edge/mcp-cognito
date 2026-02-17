# Design Document: Cognito Auth Package

## Overview

The Cognito Auth Package provides a comprehensive, production-ready authentication solution that serves as an alternative to AWS Amplify. The package consists of three main components:

1. **TypeScript Authentication Library**: Core Cognito class and utility functions for authentication operations
2. **Lambda Handlers**: Six single-purpose Lambda functions handling signup, verification, login, MFA, password changes, and password reset
3. **Infrastructure as Code**: CloudFormation template deploying Lambda functions, API Gateway, CloudWatch logs, and IAM roles

The design emphasizes separation of concerns, single responsibility principle, and developer experience. Each Lambda handler performs exactly one authentication operation, making the system easy to understand, test, and maintain.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Project Structure                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ROOT/                                                           │
│  ├── mcp-servers/cognito-mcp/          (MCP Server)            │
│  │   ├── Auth/                         (New Auth Package)       │
│  │   │   ├── class/                                             │
│  │   │   │   └── Cognito.ts           (Core Cognito class)     │
│  │   │   ├── utils/                                             │
│  │   │   │   └── helper.ts            (Utility functions)      │
│  │   │   └── handlers/                (Lambda handlers)        │
│  │   │       ├── signup.ts                                      │
│  │   │       ├── verification_code.ts                           │
│  │   │       ├── login.ts                                       │
│  │   │       ├── mfa.ts                                         │
│  │   │       ├── set_new_password.ts                            │
│  │   │       └── reset_password.ts                              │
│  │   └── server.js                    (Existing MCP server)    │
│  │                                                               │
│  ├── services/                         (Configuration)          │
│  │   ├── auth-config.yaml             (Auth configuration)     │
│  │   └── identity-providers.yaml      (IdP configuration)      │
│  │                                                               │
│  ├── resources/                                                 │
│  │   └── resources.yaml               (Cognito resources)      │
│  │                                                               │
│  └── infrastructure/                   (CloudFormation)         │
│      └── auth-stack.yaml              (Infrastructure template)│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Architecture                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend Application                                            │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────────┐                                           │
│  │   API Gateway    │                                           │
│  │                  │                                           │
│  │  POST /signup    │──────┐                                    │
│  │  POST /verify    │      │                                    │
│  │  POST /login     │      │                                    │
│  │  POST /mfa       │      │                                    │
│  │  POST /password  │      │                                    │
│  │  POST /reset     │      │                                    │
│  └──────────────────┘      │                                    │
│                             ▼                                    │
│                    ┌────────────────┐                           │
│                    │ Lambda Layer   │                           │
│                    │ (Node.js deps) │                           │
│                    └────────────────┘                           │
│                             │                                    │
│         ┌───────────────────┼───────────────────┐              │
│         ▼                   ▼                   ▼              │
│  ┌──────────┐        ┌──────────┐        ┌──────────┐         │
│  │ signup   │        │  login   │        │   mfa    │         │
│  │ Lambda   │        │  Lambda  │        │  Lambda  │         │
│  └──────────┘        └──────────┘        └──────────┘         │
│         │                   │                   │              │
│         └───────────────────┼───────────────────┘              │
│                             ▼                                    │
│                    ┌────────────────┐                           │
│                    │ Cognito Class  │                           │
│                    │ (shared code)  │                           │
│                    └────────────────┘                           │
│                             │                                    │
│                             ▼                                    │
│                    ┌────────────────┐                           │
│                    │ AWS Cognito    │                           │
│                    │  User Pool     │                           │
│                    └────────────────┘                           │
│                             │                                    │
│                             ▼                                    │
│                    ┌────────────────┐                           │
│                    │  CloudWatch    │                           │
│                    │   Logs         │                           │
│                    └────────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Cognito Class (Auth/class/Cognito.ts)

The core class encapsulating AWS Cognito operations using AWS SDK v3.

```typescript
interface CognitoConfig {
  userPoolId: string;
  clientId: string;
  region: string;
}

interface SignUpParams {
  username: string;
  password: string;
  email: string;
  attributes?: Record<string, string>;
}

interface SignUpResponse {
  userSub: string;
  codeDeliveryDetails: {
    destination: string;
    deliveryMedium: string;
    attributeName: string;
  };
}

interface VerifyCodeParams {
  username: string;
  code: string;
}

interface LoginParams {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface MFAParams {
  session: string;
  mfaCode: string;
  username: string;
}

interface SetPasswordParams {
  username: string;
  previousPassword: string;
  proposedPassword: string;
  session: string;
}

interface ResetPasswordParams {
  username: string;
  code: string;
  newPassword: string;
}

class Cognito {
  private config: CognitoConfig;
  private cognitoClient: CognitoIdentityProviderClient;

  constructor(config: CognitoConfig);
  
  async signUp(params: SignUpParams): Promise<SignUpResponse>;
  async verifyCode(params: VerifyCodeParams): Promise<void>;
  async login(params: LoginParams): Promise<LoginResponse>;
  async confirmMFA(params: MFAParams): Promise<LoginResponse>;
  async setNewPassword(params: SetPasswordParams): Promise<void>;
  async resetPassword(params: ResetPasswordParams): Promise<void>;
  async initiatePasswordReset(username: string): Promise<void>;
}
```

### 2. Helper Utilities (Auth/utils/helper.ts)

Utility functions for common operations.

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Password validation
function validatePassword(password: string): ValidationResult;

// Email validation
function validateEmail(email: string): boolean;

// Error response formatting
function formatErrorResponse(error: Error): {
  statusCode: number;
  body: string;
};

// Success response formatting
function formatSuccessResponse(data: any, statusCode?: number): {
  statusCode: number;
  body: string;
};

// Extract user attributes from Cognito format
function extractUserAttributes(attributes: Array<{Name: string, Value: string}>): Record<string, string>;

// Convert attributes to Cognito format
function toCognitoAttributes(attributes: Record<string, string>): Array<{Name: string, Value: string}>;

// Parse and validate JWT token
function parseJWT(token: string): {
  header: any;
  payload: any;
  signature: string;
};
```

### 3. Lambda Handlers

Each handler follows a consistent structure:

```typescript
// Common Lambda event/response types
interface APIGatewayEvent {
  body: string;
  headers: Record<string, string>;
  requestContext: {
    requestId: string;
    identity: {
      sourceIp: string;
    };
  };
}

interface APIGatewayResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

// Handler signature
export async function handler(event: APIGatewayEvent): Promise<APIGatewayResponse>;
```

#### signup.ts

```typescript
interface SignupRequest {
  username: string;
  password: string;
  email: string;
  attributes?: Record<string, string>;
}

// Handles user registration
// Returns: User sub and code delivery details
```

#### verification_code.ts

```typescript
interface VerificationRequest {
  username: string;
  code: string;
}

// Handles email/phone verification
// Returns: Success confirmation
```

#### login.ts

```typescript
interface LoginRequest {
  username: string;
  password: string;
}

// Handles user authentication
// Returns: JWT tokens or MFA challenge
```

#### mfa.ts

```typescript
interface MFARequest {
  session: string;
  mfaCode: string;
  username: string;
}

// Handles MFA verification
// Returns: JWT tokens
```

#### set_new_password.ts

```typescript
interface SetPasswordRequest {
  username: string;
  previousPassword: string;
  proposedPassword: string;
  session: string;
}

// Handles password changes (authenticated users)
// Returns: Success confirmation
```

#### reset_password.ts

```typescript
interface ResetPasswordRequest {
  username: string;
  code: string;
  newPassword: string;
}

interface InitiateResetRequest {
  username: string;
}

// Handles password reset flow
// Two operations: initiate reset, confirm reset
// Returns: Success confirmation
```

### 4. CloudFormation Template Structure

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Cognito Auth Package Infrastructure'

Parameters:
  UserPoolId:
    Type: String
    Description: Cognito User Pool ID
  
  ClientId:
    Type: String
    Description: Cognito App Client ID
  
  Environment:
    Type: String
    Default: dev
    AllowedValues: [dev, staging, prod]

Resources:
  # Lambda Execution Role
  LambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument: {...}
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
      Policies:
        - PolicyName: CognitoAccess
          PolicyDocument:
            Statement:
              - Effect: Allow
                Action:
                  - cognito-idp:SignUp
                  - cognito-idp:ConfirmSignUp
                  - cognito-idp:InitiateAuth
                  - cognito-idp:RespondToAuthChallenge
                  - cognito-idp:ForgotPassword
                  - cognito-idp:ConfirmForgotPassword
                Resource: !Sub 'arn:aws:cognito-idp:${AWS::Region}:${AWS::AccountId}:userpool/${UserPoolId}'

  # Node.js Lambda Layer
  NodeDependenciesLayer:
    Type: AWS::Lambda::LayerVersion
    Properties:
      LayerName: !Sub '${AWS::StackName}-node-dependencies'
      Description: Node.js dependencies for auth handlers
      Content:
        S3Bucket: !Ref DependenciesBucket
        S3Key: layers/node-dependencies.zip
      CompatibleRuntimes:
        - nodejs18.x
        - nodejs20.x

  # Lambda Functions (6 total)
  SignupFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: !Sub '${AWS::StackName}-signup'
      Runtime: nodejs20.x
      Handler: signup.handler
      Code:
        S3Bucket: !Ref CodeBucket
        S3Key: handlers/signup.zip
      Role: !GetAtt LambdaExecutionRole.Arn
      Layers:
        - !Ref NodeDependenciesLayer
      Environment:
        Variables:
          USER_POOL_ID: !Ref UserPoolId
          CLIENT_ID: !Ref ClientId
          REGION: !Ref AWS::Region
      Timeout: 30
      MemorySize: 256

  # CloudWatch Log Groups (6 total)
  SignupLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Sub '/aws/lambda/${SignupFunction}'
      RetentionInDays: 30

  # API Gateway
  AuthApi:
    Type: AWS::ApiGatewayV2::Api
    Properties:
      Name: !Sub '${AWS::StackName}-auth-api'
      ProtocolType: HTTP
      CorsConfiguration:
        AllowOrigins:
          - '*'
        AllowMethods:
          - POST
          - OPTIONS
        AllowHeaders:
          - Content-Type
          - Authorization

  # API Gateway Routes (6 total)
  SignupRoute:
    Type: AWS::ApiGatewayV2::Route
    Properties:
      ApiId: !Ref AuthApi
      RouteKey: 'POST /signup'
      Target: !Sub 'integrations/${SignupIntegration}'

  # Lambda Integrations (6 total)
  SignupIntegration:
    Type: AWS::ApiGatewayV2::Integration
    Properties:
      ApiId: !Ref AuthApi
      IntegrationType: AWS_PROXY
      IntegrationUri: !GetAtt SignupFunction.Arn
      PayloadFormatVersion: '2.0'

  # Lambda Permissions (6 total)
  SignupPermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref SignupFunction
      Action: lambda:InvokeFunction
      Principal: apigateway.amazonaws.com
      SourceArn: !Sub 'arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${AuthApi}/*/*'

Outputs:
  ApiEndpoint:
    Description: API Gateway endpoint URL
    Value: !GetAtt AuthApi.ApiEndpoint
  
  SignupUrl:
    Description: Signup endpoint
    Value: !Sub '${AuthApi.ApiEndpoint}/signup'
```

## Data Models

### Configuration Files

#### resources/resources.yaml

```yaml
cognito:
  userPool:
    id: us-east-1_XXXXXXXXX
    name: my-app-user-pool
    arn: arn:aws:cognito-idp:us-east-1:123456789012:userpool/us-east-1_XXXXXXXXX
  
  appClient:
    id: 1234567890abcdefghijklmnop
    name: my-app-client
  
  region: us-east-1
```

#### services/auth-config.yaml

```yaml
authentication:
  passwordPolicy:
    minimumLength: 12
    requireUppercase: true
    requireLowercase: true
    requireNumbers: true
    requireSymbols: true
  
  mfa:
    enabled: true
    mode: OPTIONAL
    methods:
      - SOFTWARE_TOKEN_MFA
      - SMS_MFA
  
  tokenExpiration:
    accessToken: 3600  # 1 hour
    idToken: 3600      # 1 hour
    refreshToken: 2592000  # 30 days

lambdaConfig:
  runtime: nodejs20.x
  timeout: 30
  memorySize: 256
  logRetention: 30
```

#### services/identity-providers.yaml

```yaml
identityProviders:
  saml:
    - name: okta
      metadataUrl: https://dev-12345.okta.com/app/xxx/sso/saml/metadata
      attributeMapping:
        email: http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress
        given_name: http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname
        family_name: http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname
  
  oidc:
    - name: custom-oidc
      clientId: abc123
      clientSecret: secret123
      issuer: https://auth.example.com
      authorizationEndpoint: https://auth.example.com/oauth2/authorize
      tokenEndpoint: https://auth.example.com/oauth2/token
      attributeMapping:
        email: email
        username: preferred_username
  
  social:
    google:
      clientId: 123456789-abc.apps.googleusercontent.com
      clientSecret: GOCSPX-xxxxxxxxxxxxx
      scopes:
        - email
        - profile
        - openid
    
    facebook:
      appId: 1234567890123456
      appSecret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      scopes:
        - email
        - public_profile
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I've identified the following testable properties and eliminated redundancy:

**Structural Properties (Examples - one-time verification):**
- Directory structure validation (1.1, 1.2, 1.3, 1.4, 1.5) → Combined into single structure validation
- Handler file existence (2.1-2.6, 2.8) → Combined into single handler completeness check
- CloudFormation resource existence (4.1, 4.3, 4.6, 4.7) → Combined into template completeness check
- Documentation existence (5.1-5.4, 6.1-6.4, 7.1-7.5, 12.1, 12.4, 12.5) → Combined into documentation completeness check
- Configuration file placement (8.1, 8.2, 8.4, 8.5) → Combined into configuration structure check

**Behavioral Properties (Universal rules):**
- Single responsibility (2.7) → Property about handler isolation
- TypeScript compilation (2.9, 3.1) → Property about compilation success
- CloudFormation mappings (4.2, 4.4, 4.5, 10.1) → Property about resource relationships
- API Gateway configuration (10.2, 10.4, 10.5) → Properties about endpoint behavior
- Error handling (11.1, 11.2, 11.3, 11.5) → Properties about error behavior
- Documentation completeness (12.2, 12.3) → Property about documentation coverage

**Eliminated as redundant:**
- 3.2 (CloudFormation references .js files) → Covered by 4.2 (handler mapping)
- 10.3 (CORS configuration) → Covered by template completeness check

**Not testable (require human evaluation or runtime integration):**
- 3.3, 5.5, 6.5, 7.6, 9.1-9.6, 12.6 → These require human judgment or full system integration

### Correctness Properties

Property 1: TypeScript Compilation Success
*For any* TypeScript Lambda handler file in Auth/handlers/, compiling with the TypeScript compiler should produce a corresponding JavaScript file without compilation errors.
**Validates: Requirements 2.9, 3.1**

Property 2: Handler Single Responsibility
*For any* Lambda handler invocation with valid inputs, the handler should interact with exactly one Cognito operation (signup, login, verify, MFA, password change, or password reset) and not trigger side effects in other authentication operations.
**Validates: Requirements 2.7**

Property 3: CloudFormation Lambda-Handler Mapping
*For any* Lambda function resource defined in the CloudFormation template, the handler reference should point to an existing compiled JavaScript file in the handlers directory.
**Validates: Requirements 4.2**

Property 4: CloudFormation Lambda-LogGroup Pairing
*For any* Lambda function defined in the CloudFormation template, there should exist a corresponding CloudWatch log group resource with a name matching the pattern `/aws/lambda/${FunctionName}`.
**Validates: Requirements 4.4, 4.5**

Property 5: API Gateway Endpoint Completeness
*For any* Lambda function defined in the CloudFormation template, there should exist a corresponding API Gateway route, integration, and permission resource.
**Validates: Requirements 10.1**

Property 6: API Gateway HTTP Method Configuration
*For any* API Gateway route defined in the CloudFormation template, the route key should specify a valid HTTP method (POST or GET) and a valid path.
**Validates: Requirements 10.2**

Property 7: Handler Response Format
*For any* Lambda handler response (success or error), the response should be a valid APIGatewayResponse object containing statusCode, headers, and body fields, where statusCode is a valid HTTP status code (200-599).
**Validates: Requirements 10.4**

Property 8: Request Payload Validation
*For any* Lambda handler, when invoked with an invalid or malformed request payload, the handler should return an error response (status code 400-499) without attempting the Cognito operation.
**Validates: Requirements 10.5**

Property 9: Error Logging Behavior
*For any* Lambda handler that encounters an error during execution, the handler should log an error message to CloudWatch and return an error response with a descriptive message.
**Validates: Requirements 11.1, 11.2**

Property 10: Success Logging Behavior
*For any* Lambda handler that completes successfully, the handler should log a success message with relevant context (operation type, username/identifier) to CloudWatch.
**Validates: Requirements 11.3**

Property 11: Sensitive Data Exclusion
*For any* error message returned by a Lambda handler, the message body should not contain sensitive information including passwords, tokens, or session identifiers.
**Validates: Requirements 11.5**

Property 12: Handler Documentation Coverage
*For any* Lambda handler file in Auth/handlers/, there should exist corresponding documentation that describes the handler's input parameters, response format, and includes at least one example API request.
**Validates: Requirements 12.2, 12.3**

## Error Handling

### Error Categories

1. **Validation Errors (400-level)**
   - Invalid email format
   - Weak password
   - Missing required fields
   - Invalid verification code format

2. **Authentication Errors (401)**
   - Incorrect username/password
   - Invalid or expired tokens
   - MFA code mismatch

3. **Authorization Errors (403)**
   - User not confirmed
   - User account disabled
   - Insufficient permissions

4. **Resource Errors (404)**
   - User not found
   - Invalid user pool configuration

5. **Server Errors (500-level)**
   - AWS service unavailable
   - Cognito API errors
   - Unexpected exceptions

### Error Response Format

All handlers return errors in a consistent format:

```typescript
interface ErrorResponse {
  statusCode: number;
  headers: {
    'Content-Type': 'application/json';
    'Access-Control-Allow-Origin': '*';
  };
  body: string; // JSON stringified object
}

interface ErrorBody {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}
```

### Error Handling Strategy

1. **Input Validation**: Validate all inputs before calling Cognito APIs
2. **AWS SDK Error Mapping**: Map AWS SDK errors to appropriate HTTP status codes
3. **Sanitization**: Remove sensitive data from error messages
4. **Logging**: Log all errors with context for debugging
5. **User-Friendly Messages**: Return clear, actionable error messages

### Example Error Handling

```typescript
try {
  // Validate input
  const validation = validatePassword(password);
  if (!validation.valid) {
    return formatErrorResponse(
      new Error(validation.errors.join(', ')),
      400
    );
  }
  
  // Call Cognito
  const result = await cognito.signUp({ username, password, email });
  return formatSuccessResponse(result);
  
} catch (error) {
  // Log error with context
  console.error('Signup error:', {
    requestId: event.requestContext.requestId,
    error: error.message,
    username // Don't log password!
  });
  
  // Map AWS errors to HTTP status codes
  if (error.name === 'UsernameExistsException') {
    return formatErrorResponse(error, 409);
  }
  if (error.name === 'InvalidPasswordException') {
    return formatErrorResponse(error, 400);
  }
  
  // Generic server error
  return formatErrorResponse(error, 500);
}
```

## Testing Strategy

The Cognito Auth Package requires a dual testing approach combining unit tests and property-based tests to ensure comprehensive coverage and correctness.

### Testing Philosophy

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs
- **Balance**: Avoid excessive unit tests; let property tests handle input coverage
- **Focus**: Unit tests for integration points and specific scenarios; property tests for general correctness

### Property-Based Testing

**Library**: fast-check (for TypeScript/JavaScript)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: cognito-auth-package, Property {N}: {property text}`

**Property Test Coverage**:

1. **TypeScript Compilation** (Property 1)
   - Generate: Random TypeScript handler files with valid syntax
   - Test: Compilation produces JavaScript without errors
   - Verify: Output file exists and is valid JavaScript

2. **Handler Single Responsibility** (Property 2)
   - Generate: Random valid inputs for each handler
   - Test: Handler calls only its designated Cognito operation
   - Verify: No side effects to other operations (mock Cognito client)

3. **CloudFormation Mappings** (Properties 3, 4, 5, 6)
   - Generate: CloudFormation template variations
   - Test: All Lambda functions have handlers, log groups, API routes
   - Verify: Resource relationships are complete and correct

4. **Response Format** (Property 7)
   - Generate: Random handler inputs (valid and invalid)
   - Test: All responses match APIGatewayResponse schema
   - Verify: Status codes are in valid range (200-599)

5. **Request Validation** (Property 8)
   - Generate: Invalid/malformed request payloads
   - Test: Handlers reject invalid inputs before Cognito calls
   - Verify: Error responses with 4xx status codes

6. **Error Handling** (Properties 9, 11)
   - Generate: Inputs that trigger various error conditions
   - Test: Errors are logged and returned properly
   - Verify: No sensitive data in error messages

7. **Success Logging** (Property 10)
   - Generate: Valid inputs for successful operations
   - Test: Success operations produce log entries
   - Verify: Logs contain operation context

8. **Documentation Coverage** (Property 12)
   - Generate: List of all handler files
   - Test: Each handler has corresponding documentation
   - Verify: Documentation includes required sections

### Unit Testing

**Focus Areas**:

1. **Cognito Class Methods**
   - Test specific Cognito API interactions
   - Mock AWS SDK responses
   - Verify correct parameter passing

2. **Helper Functions**
   - Password validation edge cases (empty, too short, missing requirements)
   - Email validation (valid formats, invalid formats)
   - Response formatting (success, various error types)
   - JWT parsing (valid tokens, malformed tokens)

3. **Lambda Handler Integration**
   - Example requests for each handler
   - Error scenarios (user not found, invalid code, etc.)
   - API Gateway event parsing

4. **CloudFormation Template**
   - Template syntax validation
   - Resource count verification (6 Lambdas, 6 log groups, etc.)
   - IAM permission completeness

### Example Property Test

```typescript
import fc from 'fast-check';
import { handler as signupHandler } from '../handlers/signup';

// Feature: cognito-auth-package, Property 7: Handler Response Format
describe('Property 7: Handler Response Format', () => {
  it('should return valid APIGatewayResponse for any input', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string(),
          password: fc.string(),
          email: fc.emailAddress()
        }),
        async (input) => {
          const event = {
            body: JSON.stringify(input),
            headers: {},
            requestContext: {
              requestId: 'test-request-id',
              identity: { sourceIp: '127.0.0.1' }
            }
          };
          
          const response = await signupHandler(event);
          
          // Verify response structure
          expect(response).toHaveProperty('statusCode');
          expect(response).toHaveProperty('headers');
          expect(response).toHaveProperty('body');
          
          // Verify status code is valid HTTP code
          expect(response.statusCode).toBeGreaterThanOrEqual(200);
          expect(response.statusCode).toBeLessThan(600);
          
          // Verify body is valid JSON
          expect(() => JSON.parse(response.body)).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Example Unit Test

```typescript
import { validatePassword } from '../utils/helper';

describe('Password Validation', () => {
  it('should reject passwords shorter than 12 characters', () => {
    const result = validatePassword('Short1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must be at least 12 characters');
  });
  
  it('should reject passwords without uppercase letters', () => {
    const result = validatePassword('lowercase123!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain uppercase letters');
  });
  
  it('should accept valid passwords', () => {
    const result = validatePassword('ValidPass123!');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

### Testing Checklist

- [ ] All 12 correctness properties have property-based tests
- [ ] Each property test runs minimum 100 iterations
- [ ] All property tests are tagged with feature name and property number
- [ ] Unit tests cover helper function edge cases
- [ ] Unit tests cover Cognito class methods with mocked AWS SDK
- [ ] Unit tests cover example requests for each handler
- [ ] CloudFormation template validation tests
- [ ] Integration tests for API Gateway → Lambda → Cognito flow
- [ ] Error handling tests for all error categories
- [ ] Sensitive data exclusion tests for error messages

## Identity Provider Integration Documentation

The Auth Package includes comprehensive documentation for integrating external identity providers. This documentation is designed to enable junior developers to complete integrations without senior developer assistance.

### Documentation Structure

```
cognito-mcp/Auth/docs/
├── README.md                          # Package overview and quick start
├── identity-providers/
│   ├── saml-integration.md           # SAML provider guide
│   ├── oidc-integration.md           # OIDC provider guide
│   ├── google-integration.md         # Google OAuth guide
│   └── facebook-integration.md       # Facebook OAuth guide
├── api-reference/
│   ├── signup.md                     # Signup handler API
│   ├── verification.md               # Verification handler API
│   ├── login.md                      # Login handler API
│   ├── mfa.md                        # MFA handler API
│   ├── set-password.md               # Set password handler API
│   └── reset-password.md             # Reset password handler API
├── deployment/
│   ├── cloudformation-deployment.md  # CloudFormation deployment guide
│   ├── configuration.md              # Configuration file guide
│   └── troubleshooting.md            # Common issues and solutions
└── examples/
    ├── react-integration.md          # React app example
    ├── vue-integration.md            # Vue app example
    └── api-integration.md            # Backend API example
```

### SAML Integration Guide Content

The SAML integration documentation includes:

1. **Prerequisites**
   - AWS Cognito User Pool setup
   - SAML provider account (Okta, Azure AD, OneLogin)
   - Admin access to both systems

2. **Step-by-Step Configuration**
   - Obtaining SAML metadata XML from provider
   - Creating SAML identity provider in Cognito
   - Configuring attribute mapping
   - Testing SAML authentication flow

3. **Attribute Mapping Examples**
   ```yaml
   # Common SAML attribute mappings
   email: http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress
   given_name: http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname
   family_name: http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname
   ```

4. **Provider-Specific Guides**
   - Okta SAML configuration
   - Azure AD SAML configuration
   - OneLogin SAML configuration

5. **Troubleshooting**
   - Common SAML errors
   - Attribute mapping issues
   - Certificate problems

### OIDC Integration Guide Content

The OIDC integration documentation includes:

1. **Prerequisites**
   - OIDC provider account
   - Client ID and client secret
   - Discovery endpoint URL

2. **Step-by-Step Configuration**
   - Registering application with OIDC provider
   - Obtaining client credentials
   - Configuring OIDC provider in Cognito
   - Setting up authorization and token endpoints
   - Configuring scopes

3. **Endpoint Configuration**
   ```yaml
   issuer: https://auth.example.com
   authorization_endpoint: https://auth.example.com/oauth2/authorize
   token_endpoint: https://auth.example.com/oauth2/token
   userinfo_endpoint: https://auth.example.com/oauth2/userinfo
   jwks_uri: https://auth.example.com/.well-known/jwks.json
   ```

4. **Attribute Mapping**
   ```yaml
   email: email
   username: preferred_username
   given_name: given_name
   family_name: family_name
   ```

5. **Testing OIDC Flow**
   - Authorization code flow walkthrough
   - Token validation
   - User info retrieval

### Social Provider Integration Guides

#### Google Integration

1. **Google Cloud Console Setup**
   - Creating OAuth 2.0 credentials
   - Configuring authorized redirect URIs
   - Obtaining client ID and secret

2. **Cognito Configuration**
   - Adding Google as identity provider
   - Configuring scopes (email, profile, openid)
   - Attribute mapping

3. **Example Configuration**
   ```yaml
   google:
     clientId: 123456789-abc.apps.googleusercontent.com
     clientSecret: GOCSPX-xxxxxxxxxxxxx
     scopes:
       - email
       - profile
       - openid
     attributeMapping:
       email: email
       given_name: given_name
       family_name: family_name
       picture: picture
   ```

#### Facebook Integration

1. **Facebook Developer Setup**
   - Creating Facebook app
   - Configuring OAuth redirect URIs
   - Obtaining app ID and secret

2. **Cognito Configuration**
   - Adding Facebook as identity provider
   - Configuring scopes (email, public_profile)
   - Attribute mapping

3. **Example Configuration**
   ```yaml
   facebook:
     appId: 1234567890123456
     appSecret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     scopes:
       - email
       - public_profile
     attributeMapping:
       email: email
       given_name: first_name
       family_name: last_name
   ```

### API Reference Documentation

Each Lambda handler has detailed API documentation including:

1. **Endpoint Information**
   - HTTP method
   - URL path
   - Authentication requirements

2. **Request Format**
   - Headers
   - Body parameters
   - Parameter types and constraints

3. **Response Format**
   - Success response structure
   - Error response structure
   - Status codes

4. **Example Requests**
   - cURL examples
   - JavaScript fetch examples
   - Python requests examples

5. **Error Codes**
   - Possible error codes
   - Error descriptions
   - Resolution steps

### Example: Signup Handler API Documentation

```markdown
# Signup Handler API

## Endpoint

POST /signup

## Description

Creates a new user account in the Cognito User Pool.

## Request

### Headers
- Content-Type: application/json

### Body Parameters
- username (string, required): Unique username for the account
- password (string, required): Password meeting policy requirements
- email (string, required): Valid email address
- attributes (object, optional): Additional user attributes

### Example Request

```bash
curl -X POST https://api.example.com/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "SecurePass123!",
    "email": "john@example.com",
    "attributes": {
      "given_name": "John",
      "family_name": "Doe"
    }
  }'
```

## Response

### Success Response (200)

```json
{
  "userSub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "codeDeliveryDetails": {
    "destination": "j***@example.com",
    "deliveryMedium": "EMAIL",
    "attributeName": "email"
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "error": {
    "code": "InvalidPasswordException",
    "message": "Password does not meet requirements",
    "requestId": "abc-123"
  }
}
```

#### 409 Conflict
```json
{
  "error": {
    "code": "UsernameExistsException",
    "message": "An account with this username already exists",
    "requestId": "abc-123"
  }
}
```

## Error Codes

| Code | Status | Description | Resolution |
|------|--------|-------------|------------|
| InvalidPasswordException | 400 | Password doesn't meet policy | Use stronger password |
| InvalidParameterException | 400 | Invalid email format | Provide valid email |
| UsernameExistsException | 409 | Username already taken | Choose different username |
| InternalErrorException | 500 | AWS service error | Retry request |

## Next Steps

After successful signup, the user receives a verification code via email. Use the `/verify` endpoint to confirm the account.
```

### Deployment Documentation

The deployment documentation includes:

1. **Prerequisites**
   - AWS CLI configuration
   - Required IAM permissions
   - S3 bucket for Lambda code

2. **Build Process**
   - TypeScript compilation steps
   - Dependency packaging
   - Lambda layer creation

3. **CloudFormation Deployment**
   - Parameter configuration
   - Stack creation command
   - Stack update command
   - Rollback procedures

4. **Post-Deployment**
   - Testing endpoints
   - Configuring frontend applications
   - Monitoring setup

5. **Configuration Management**
   - Updating resources.yaml
   - Managing service configurations
   - Environment-specific settings

### Troubleshooting Guide

Common issues and solutions:

1. **Compilation Errors**
   - TypeScript version mismatches
   - Missing dependencies
   - Type definition issues

2. **Deployment Failures**
   - IAM permission errors
   - CloudFormation stack errors
   - Lambda timeout issues

3. **Runtime Errors**
   - Cognito configuration errors
   - Invalid credentials
   - Network connectivity issues

4. **Integration Issues**
   - CORS errors
   - Invalid callback URLs
   - Token validation failures

Each issue includes:
- Symptom description
- Root cause explanation
- Step-by-step resolution
- Prevention tips

## Implementation Notes

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./Auth",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["Auth/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Build Script

```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "package": "npm run build && npm run package:handlers && npm run package:layer",
    "package:handlers": "cd dist/handlers && for f in *.js; do zip \"${f%.js}.zip\" \"$f\"; done",
    "package:layer": "mkdir -p layer/nodejs && cp -r node_modules layer/nodejs/ && cd layer && zip -r ../node-dependencies.zip .",
    "deploy": "npm run package && aws cloudformation deploy --template-file infrastructure/auth-stack.yaml --stack-name cognito-auth-stack --capabilities CAPABILITY_IAM"
  }
}
```

### Dependencies

```json
{
  "dependencies": {
    "@aws-sdk/client-cognito-identity-provider": "^3.x.x"
  },
  "devDependencies": {
    "@types/aws-lambda": "^8.x.x",
    "@types/node": "^20.x.x",
    "typescript": "^5.x.x",
    "jest": "^29.x.x",
    "@types/jest": "^29.x.x",
    "ts-jest": "^29.x.x",
    "fast-check": "^3.x.x"
  }
}
```

### Security Considerations

1. **Secrets Management**
   - Never commit client secrets to version control
   - Use AWS Secrets Manager or Parameter Store
   - Rotate credentials regularly

2. **IAM Permissions**
   - Follow principle of least privilege
   - Separate roles for different environments
   - Enable CloudTrail logging

3. **Input Validation**
   - Validate all inputs before processing
   - Sanitize error messages
   - Implement rate limiting

4. **Token Security**
   - Use short-lived access tokens
   - Implement token rotation
   - Validate tokens on every request

5. **Logging**
   - Never log sensitive data
   - Implement structured logging
   - Set appropriate retention periods
