/**
 * Verification Code Lambda Handler
 * 
 * Handles email/phone verification with AWS Cognito User Pool.
 * 
 * Requirements: 2.2, 2.7, 2.8, 11.1, 11.2, 11.3
 */

import { Cognito, VerifyCodeParams } from '../class/Cognito';
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
 * Verification request body interface
 */
interface VerificationRequest {
  username: string;
  code: string;
}

/**
 * Lambda handler for user verification
 * 
 * @param event - API Gateway event
 * @returns API Gateway response
 */
export async function handler(event: APIGatewayEvent): Promise<APIGatewayResponse> {
  const requestId = event.requestContext.requestId;
  const sourceIp = event.requestContext.identity.sourceIp;

  try {
    // Parse request body
    let requestBody: VerificationRequest;
    try {
      requestBody = JSON.parse(event.body);
    } catch (error) {
      console.error('Verification error - Invalid JSON:', {
        requestId,
        sourceIp,
        error: 'Failed to parse request body',
      });
      return formatErrorResponse(new Error('Invalid request body: must be valid JSON'), 400);
    }

    // Validate required fields
    if (!requestBody.username || !requestBody.code) {
      console.error('Verification error - Missing required fields:', {
        requestId,
        sourceIp,
        hasUsername: !!requestBody.username,
        hasCode: !!requestBody.code,
      });
      return formatErrorResponse(
        new Error('Missing required fields: username and code are required'),
        400
      );
    }

    // Validate code format (basic validation - should be non-empty string)
    if (typeof requestBody.code !== 'string' || requestBody.code.trim().length === 0) {
      console.error('Verification error - Invalid code format:', {
        requestId,
        sourceIp,
        username: requestBody.username,
      });
      return formatErrorResponse(new Error('Invalid verification code format'), 400);
    }

    // Initialize Cognito class with environment variables
    const userPoolId = process.env.USER_POOL_ID;
    const clientId = process.env.CLIENT_ID;
    const region = process.env.REGION || process.env.AWS_REGION || 'us-east-1';

    if (!userPoolId || !clientId) {
      console.error('Verification error - Missing environment variables:', {
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

    // Prepare verification parameters
    const verifyParams: VerifyCodeParams = {
      username: requestBody.username,
      code: requestBody.code.trim(),
    };

    // Call Cognito verifyCode
    await cognito.verifyCode(verifyParams);

    // Log successful verification
    console.log('Verification successful:', {
      requestId,
      sourceIp,
      username: requestBody.username,
    });

    // Return success response
    return formatSuccessResponse(
      { message: 'User verification successful' },
      200
    );

  } catch (error: any) {
    // Log error with context (without sensitive data)
    console.error('Verification error:', {
      requestId,
      sourceIp,
      errorName: error.name,
      errorMessage: error.message,
    });

    // Map AWS Cognito errors to appropriate HTTP status codes
    if (error.name === 'CodeMismatchException') {
      return formatErrorResponse(
        new Error('Invalid verification code'),
        400
      );
    }

    if (error.name === 'ExpiredCodeException') {
      return formatErrorResponse(
        new Error('Verification code has expired'),
        400
      );
    }

    if (error.name === 'UserNotFoundException') {
      return formatErrorResponse(
        new Error('User not found'),
        404
      );
    }

    if (error.name === 'NotAuthorizedException') {
      return formatErrorResponse(
        new Error('User is already confirmed'),
        400
      );
    }

    if (error.name === 'TooManyFailedAttemptsException') {
      return formatErrorResponse(
        new Error('Too many failed attempts. Please try again later'),
        429
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
        new Error('Verification limit exceeded. Please try again later'),
        429
      );
    }

    // Generic server error for unexpected errors
    return formatErrorResponse(
      new Error('An unexpected error occurred during verification'),
      500
    );
  }
}
