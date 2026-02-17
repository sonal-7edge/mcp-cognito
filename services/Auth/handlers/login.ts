/**
 * Login Lambda Handler
 * 
 * Handles user authentication with AWS Cognito User Pool.
 * Supports standard login and MFA challenge responses.
 * 
 * Requirements: 2.3, 2.7, 2.8, 11.1, 11.2, 11.3
 */

import { Cognito, LoginParams } from '../class/Cognito';
import {
  formatErrorResponse,
  formatSuccessResponse,
} from '../utils/helper';

/**
 * API Gateway Event interface
 */
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

/**
 * API Gateway Response interface
 */
interface APIGatewayResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

/**
 * Login request body interface
 */
interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Lambda handler for user login
 * 
 * @param event - API Gateway event
 * @returns API Gateway response with tokens or MFA challenge
 */
export async function handler(event: APIGatewayEvent): Promise<APIGatewayResponse> {
  const requestId = event.requestContext.requestId;
  const sourceIp = event.requestContext.identity.sourceIp;

  try {
    // Parse request body
    let requestBody: LoginRequest;
    try {
      requestBody = JSON.parse(event.body);
    } catch (error) {
      console.error('Login error - Invalid JSON:', {
        requestId,
        sourceIp,
        error: 'Failed to parse request body',
      });
      return formatErrorResponse(new Error('Invalid request body: must be valid JSON'), 400);
    }

    // Validate required fields
    if (!requestBody.username || !requestBody.password) {
      console.error('Login error - Missing required fields:', {
        requestId,
        sourceIp,
        hasUsername: !!requestBody.username,
        hasPassword: !!requestBody.password,
      });
      return formatErrorResponse(
        new Error('Missing required fields: username and password are required'),
        400
      );
    }

    // Initialize Cognito class with environment variables
    const userPoolId = process.env.USER_POOL_ID;
    const clientId = process.env.CLIENT_ID;
    const region = process.env.REGION || process.env.AWS_REGION || 'us-east-1';

    if (!userPoolId || !clientId) {
      console.error('Login error - Missing environment variables:', {
        requestId,
        hasUserPoolId: !!userPoolId,
        hasClientId: !!clientId,
      });
      return formatErrorResponse(
        new Error('Server configuration error: missing Cognito configuration'),
        500
      );
    }

    const cognito = new Cognito({
      userPoolId,
      clientId,
      region,
    });

    // Prepare login parameters
    const loginParams: LoginParams = {
      username: requestBody.username,
      password: requestBody.password,
    };

    // Call Cognito login
    const result = await cognito.login(loginParams);

    // Log successful login
    console.log('Login successful:', {
      requestId,
      sourceIp,
      username: requestBody.username,
      tokenType: result.tokenType,
      expiresIn: result.expiresIn,
    });

    // Return success response with tokens
    return formatSuccessResponse(result, 200);

  } catch (error: any) {
    // Log error with context (without sensitive data)
    console.error('Login error:', {
      requestId,
      sourceIp,
      errorName: error.name,
      errorMessage: error.message,
    });

    // Handle MFA challenge response
    if (error.message && error.message.startsWith('MFA_REQUIRED:')) {
      const session = error.message.split(':')[1];
      
      console.log('Login requires MFA:', {
        requestId,
        sourceIp,
      });

      return formatSuccessResponse({
        challengeName: 'MFA_REQUIRED',
        session: session,
        message: 'MFA verification required. Please provide MFA code.',
      }, 200);
    }

    // Map AWS Cognito errors to appropriate HTTP status codes
    if (error.name === 'NotAuthorizedException') {
      return formatErrorResponse(
        new Error('Incorrect username or password'),
        401
      );
    }

    if (error.name === 'UserNotConfirmedException') {
      return formatErrorResponse(
        new Error('User account is not confirmed. Please verify your email'),
        403
      );
    }

    if (error.name === 'UserNotFoundException') {
      return formatErrorResponse(
        new Error('Incorrect username or password'),
        401
      );
    }

    if (error.name === 'InvalidParameterException') {
      return formatErrorResponse(
        new Error('Invalid parameter provided'),
        400
      );
    }

    if (error.name === 'TooManyRequestsException') {
      return formatErrorResponse(
        new Error('Too many requests. Please try again later'),
        429
      );
    }

    if (error.name === 'PasswordResetRequiredException') {
      return formatErrorResponse(
        new Error('Password reset required. Please reset your password'),
        403
      );
    }

    if (error.name === 'UserLambdaValidationException') {
      return formatErrorResponse(
        new Error('User validation failed'),
        403
      );
    }

    // Generic server error for unexpected errors
    return formatErrorResponse(
      new Error('An unexpected error occurred during login'),
      500
    );
  }
}
