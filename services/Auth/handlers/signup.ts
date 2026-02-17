/**
 * Signup Lambda Handler
 * 
 * Handles user registration with AWS Cognito User Pool.
 * 
 * Requirements: 2.1, 2.7, 2.8, 11.1, 11.2, 11.3, 11.5
 */

import { Cognito, SignUpParams } from '../class/Cognito';
import {
  validatePassword,
  validateEmail,
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
 * Signup request body interface
 */
interface SignupRequest {
  username: string;
  password: string;
  email: string;
  attributes?: Record<string, string>;
}

/**
 * Lambda handler for user signup
 * 
 * @param event - API Gateway event
 * @returns API Gateway response
 */
export async function handler(event: APIGatewayEvent): Promise<APIGatewayResponse> {
  const requestId = event.requestContext.requestId;
  const sourceIp = event.requestContext.identity.sourceIp;

  try {
    // Parse request body
    let requestBody: SignupRequest;
    try {
      requestBody = JSON.parse(event.body);
    } catch (error) {
      console.error('Signup error - Invalid JSON:', {
        requestId,
        sourceIp,
        error: 'Failed to parse request body',
      });
      return formatErrorResponse(new Error('Invalid request body: must be valid JSON'), 400);
    }

    // Validate required fields
    if (!requestBody.username || !requestBody.password || !requestBody.email) {
      console.error('Signup error - Missing required fields:', {
        requestId,
        sourceIp,
        hasUsername: !!requestBody.username,
        hasPassword: !!requestBody.password,
        hasEmail: !!requestBody.email,
      });
      return formatErrorResponse(
        new Error('Missing required fields: username, password, and email are required'),
        400
      );
    }

    // Validate email format
    if (!validateEmail(requestBody.email)) {
      console.error('Signup error - Invalid email format:', {
        requestId,
        sourceIp,
        username: requestBody.username,
      });
      return formatErrorResponse(new Error('Invalid email format'), 400);
    }

    // Validate password
    const passwordValidation = validatePassword(requestBody.password);
    if (!passwordValidation.valid) {
      console.error('Signup error - Password validation failed:', {
        requestId,
        sourceIp,
        username: requestBody.username,
        errors: passwordValidation.errors,
      });
      return formatErrorResponse(
        new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`),
        400
      );
    }

    // Initialize Cognito class with environment variables
    const userPoolId = process.env.USER_POOL_ID;
    const clientId = process.env.CLIENT_ID;
    const region = process.env.REGION || process.env.AWS_REGION || 'us-east-1';

    if (!userPoolId || !clientId) {
      console.error('Signup error - Missing environment variables:', {
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

    // Prepare signup parameters
    const signUpParams: SignUpParams = {
      username: requestBody.username,
      password: requestBody.password,
      email: requestBody.email,
      attributes: requestBody.attributes,
    };

    // Call Cognito signUp
    const result = await cognito.signUp(signUpParams);

    // Log successful signup
    console.log('Signup successful:', {
      requestId,
      sourceIp,
      username: requestBody.username,
      userSub: result.userSub,
      deliveryMedium: result.codeDeliveryDetails.deliveryMedium,
    });

    // Return success response
    return formatSuccessResponse(result, 200);

  } catch (error: any) {
    // Log error with context (without sensitive data)
    console.error('Signup error:', {
      requestId,
      sourceIp,
      errorName: error.name,
      errorMessage: error.message,
    });

    // Map AWS Cognito errors to appropriate HTTP status codes
    if (error.name === 'UsernameExistsException') {
      return formatErrorResponse(
        new Error('An account with this username already exists'),
        409
      );
    }

    if (error.name === 'InvalidPasswordException') {
      return formatErrorResponse(
        new Error('Password does not meet requirements'),
        400
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

    if (error.name === 'LimitExceededException') {
      return formatErrorResponse(
        new Error('Account creation limit exceeded. Please try again later'),
        429
      );
    }

    // Generic server error for unexpected errors
    return formatErrorResponse(
      new Error('An unexpected error occurred during signup'),
      500
    );
  }
}
