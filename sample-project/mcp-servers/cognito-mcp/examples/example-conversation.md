# Example Conversation Flow

This document shows a complete example of configuring Cognito using the interactive tool.

## Scenario: Multi-tenant SaaS Web Application

### Initial Request

**Developer:** "I need to set up Cognito for my multi-tenant SaaS application"

**Kiro:** "Great! I'll help you configure AWS Cognito for your multi-tenant SaaS application. Let me gather some information to create the best configuration for your needs.

First, what type of application is this?
- Web application (SPA or traditional)
- Mobile application
- Both web and mobile"

### Application Type

**Developer:** "Web application, it's a React SPA"

**Kiro:** "Perfect! For a React SPA, I'll configure OAuth with PKCE for security. 

Now, for multi-tenant architecture, there are three main approaches:

1. **User Pool per Tenant** (Highest Isolation)
   - Separate User Pool for each tenant
   - Complete data isolation
   - Best for: Enterprise customers, strict compliance

2. **App Client per Tenant** (Moderate Isolation)
   - Single User Pool, separate App Client per tenant
   - Shared infrastructure, isolated auth flows
   - Best for: SaaS with multiple customer tiers

3. **Custom Attributes** (Logical Isolation)
   - Single User Pool and App Client
   - tenant_id in custom attributes
   - Application handles tenant filtering
   - Best for: Cost-effective multi-tenancy

Which approach fits your needs?"

### Multi-tenant Strategy

**Developer:** "App Client per tenant sounds right. We have about 50 customers"

**Kiro:** "Excellent choice! App Client isolation works well for your scale. I'll configure:
- Single User Pool
- Ability to create multiple App Clients (one per tenant)
- Custom attribute for tenant_id as backup
- Pre-signup trigger option for tenant validation

Now, let's configure authentication. For SaaS applications, I recommend:
- Email + Password authentication
- Auto-verify email addresses

Does this work for you?"

### Authentication Method

**Developer:** "Yes, email and password is fine"

**Kiro:** "Great! Now for security - Multi-Factor Authentication (MFA):

- **OFF**: No MFA (not recommended for SaaS)
- **OPTIONAL**: Users can enable MFA (recommended for SaaS)
- **REQUIRED**: All users must use MFA (highest security)

For a SaaS application, I recommend OPTIONAL to start, allowing security-conscious users to enable it. What would you prefer?"

### MFA Configuration

**Developer:** "Let's go with OPTIONAL"

**Kiro:** "Good choice! For MFA methods, you can offer:
- **TOTP** (Authenticator apps like Google Authenticator) - No cost, more secure
- **SMS** (Text messages) - Costs per message, easier for users
- **Both** - Maximum flexibility

I recommend TOTP for cost and security. Which would you like?"

**Developer:** "Both, let users choose"

**Kiro:** "Perfect! I'll enable both TOTP and SMS MFA methods.

Now for password policy. For a SaaS application, I recommend:
- Minimum length: 12 characters
- Require: uppercase, lowercase, numbers, special characters
- Temporary password validity: 7 days

Would you like to customize any of these?"

### Password Policy

**Developer:** "That's fine"

**Kiro:** "Excellent! Now for Advanced Security Features:

**Advanced Security Mode:**
- **OFF**: No advanced security
- **AUDIT**: Monitor suspicious activity, don't block
- **ENFORCED**: Block suspicious activity (recommended for production)

I recommend ENFORCED for production. This includes:
- Compromised credentials check (blocks leaked passwords)
- Adaptive authentication (risk-based challenges)
- IP-based risk detection

Should I enable ENFORCED mode?"

### Advanced Security

**Developer:** "Yes, enable ENFORCED"

**Kiro:** "Great security choice! 

For device tracking (remembering user devices):
- **OFF**: Don't track devices
- **ALWAYS**: Always remember devices
- **USER_OPT_IN**: Let users choose

For SaaS, USER_OPT_IN gives users control. Is that okay?"

**Developer:** "Yes"

**Kiro:** "Perfect! Now for email configuration:

**Cognito Default:**
- Easy setup, no configuration
- Limited to 50 emails per day
- From: no-reply@verificationemail.com

**Amazon SES:**
- Higher limits (50,000+ emails/day)
- Custom from address
- Better deliverability
- Requires SES setup

For production SaaS, I strongly recommend SES. Which would you prefer?"

### Email Configuration

**Developer:** "Let's use SES. Our domain is myapp.com"

**Kiro:** "Excellent! For SES integration, I'll need:
1. From email address (e.g., noreply@myapp.com)
2. Reply-to email address (e.g., support@myapp.com)

Note: You'll need to verify your domain in SES and provide the SES source ARN.

What email addresses should I use?"

**Developer:** "noreply@myapp.com for from, support@myapp.com for reply-to"

**Kiro:** "Perfect! I'll configure those.

Now for App Client settings. For your React SPA, I recommend:
- OAuth Flow: Authorization Code with PKCE
- Access token validity: 1 hour
- ID token validity: 1 hour
- Refresh token validity: 30 days
- Refresh token rotation: Enabled

What are your callback URLs? (e.g., https://myapp.com/callback)"

### App Client Configuration

**Developer:** "https://app.myapp.com/callback for callback, https://app.myapp.com/logout for logout"

**Kiro:** "Got it! For the domain, you can use:
- Cognito domain: myapp-prod.auth.us-east-1.amazoncognito.com
- Custom domain: auth.myapp.com (requires ACM certificate)

Which would you prefer? I can start with Cognito domain and you can add custom later."

**Developer:** "Cognito domain is fine for now. Use 'myapp' as the prefix"

**Kiro:** "Perfect! Let me add the custom attributes for multi-tenancy:
- tenant_id (String, required, immutable)
- role (String, optional, mutable)

Any other custom attributes you need?"

**Developer:** "Can we add company_name?"

**Kiro:** "Absolutely! I'll add:
- company_name (String, optional, mutable)

For Lambda triggers, would you like to add any? Common ones for multi-tenant:
- Pre-signup: Validate tenant_id and email domain
- Post-confirmation: Send welcome email, provision tenant resources
- Pre-authentication: Additional tenant validation

Would you like any of these?"

### Lambda Triggers

**Developer:** "Not right now, we'll add those later"

**Kiro:** "No problem! You can add Lambda triggers anytime.

Let me summarize your configuration:

**Application:** Multi-tenant SaaS Web Application (React SPA)
**Multi-tenant Strategy:** App Client per tenant
**Authentication:** Email + Password
**MFA:** OPTIONAL (TOTP and SMS)
**Password Policy:** 12 chars min, all complexity requirements
**Advanced Security:** ENFORCED mode with compromised credentials check
**Device Tracking:** USER_OPT_IN
**Email:** SES (noreply@myapp.com)
**App Client:** Authorization Code with PKCE, 1h access/ID tokens, 30d refresh
**Callback URLs:** https://app.myapp.com/callback
**Domain:** myapp.auth.us-east-1.amazoncognito.com
**Custom Attributes:** tenant_id, role, company_name

Does this look correct?"

### Final Confirmation

**Developer:** "Yes, looks good!"

**Kiro:** "Excellent! I'll now generate:
1. CloudFormation template
2. Configuration summary
3. Deployment guide

Generating files..."

*[Kiro generates the files]*

**Kiro:** "Done! I've created:

1. `output/cloudformation-template.yaml` - Your complete CloudFormation template
2. `output/configuration-summary.md` - Human-readable summary
3. `output/deployment-guide.md` - Step-by-step deployment instructions

Key next steps:
1. Set up SES and verify myapp.com domain
2. Update the CloudFormation template with your SES source ARN
3. Deploy to dev environment first for testing
4. Create additional App Clients for each tenant
5. Configure your React app with the Cognito endpoints

Would you like me to explain any part of the configuration or help with deployment?"

## Follow-up Questions

**Developer:** "How do I create App Clients for each tenant?"

**Kiro:** "Great question! For App Client per tenant, you have two options:

**Option 1: CloudFormation (Recommended)**
Create a separate stack or template for each tenant's App Client:

```yaml
Resources:
  TenantAppClient:
    Type: AWS::Cognito::UserPoolClient
    Properties:
      ClientName: !Sub 'tenant-${TenantId}-client'
      UserPoolId: !Ref ExistingUserPoolId
      # ... same settings as main client
```

**Option 2: AWS CLI**
```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id us-east-1_XXXXX \
  --client-name tenant-acme-client \
  --callback-urls https://acme.myapp.com/callback
```

**Option 3: AWS SDK (Programmatic)**
When onboarding a new tenant, your application can create the App Client:

```javascript
const cognito = new AWS.CognitoIdentityServiceProvider();
const params = {
  UserPoolId: 'us-east-1_XXXXX',
  ClientName: `tenant-${tenantId}-client`,
  CallbackURLs: [`https://${tenantSubdomain}.myapp.com/callback`],
  // ... other settings
};
await cognito.createUserPoolClient(params).promise();
```

I recommend Option 3 for dynamic tenant onboarding. Would you like me to create a sample onboarding script?"

**Developer:** "Yes please!"

**Kiro:** "I'll create a tenant onboarding script for you..."

*[Continues with additional assistance]*
