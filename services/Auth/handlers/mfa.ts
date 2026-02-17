/**
 * MFA Lambda Handler
 * 
 * Handles multi-factor authentication verification with AWS Cognito User Pool.
 * 
 * Requirements: 2.4, 2.7, 2.8, 11.1, 11.2, 11.3
 */

import { Cognito, MFAParams } from '../class/Cognito';
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
 * MFA request body interface
 */
interface MFARequest {
  session: string;
  mfaCode: string;
  username: string;
}

/**
 * Lambda handler for MFA verification
 * 
 * @param event - API Gateway event
 * @returns API Gateway response with tokens
 */
export async function handler(event: APIGatewayEvent): Promise<APIGatewayResponse> {
  const requestId = event.requestContext.requestId;
  const sourceIp = event.requestContext.identity.sourceIp;

  try {
    // Parse request body
    let requestBody: MFARequest;
    try {
      requestBody = JSON.parse(event.body);
    } catch (error) {
      console.error('MFA error - Invalid JSON:', {
        requestId,
        sourceIp,
        error: 'Failed to parse request body',
      });
      return formatErrorResponse(new Error('Invalid request body: must be valid JSON'), 400);
    }

    // Validate required fields
    if (!requestBody.session || !requestBody.mfaCode || !requestBody.username) {
      console.error('MFA error - Missing required fields:', {
        requestId,
        sourceIp,
        hasSession: !!requestBody.session,
        hasMfaCode: !!requestBody.mfaCode,
        hasUsername: !!requestBody.username,
      });
      return formatErrorResponse(
        new Error('Missing required fields: session, mfaCode, and username are required'),
        400
      );
    }

    // Initialize Cognito class with environment variables
    const userPoolId = process.env.USER_POOL_ID;
    const clientId = process.env.CLIENT_ID;
    const region = process.env.REGION || process.env.AWS_REGION || 'us-east-1';

    if (!userPoolId || !clientId) {
      console.error('MFA error - Missing environment variables:', {
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

    // Prepare MFA parameters
    const mfaParams: MFAParams = {
      session: requestBody.session,
      mfaCode: requestBody.mfaCode,
      username: requestBody.username,
    };

    // Call Cognito confirmMFA
    const result = await cognito.confirmMFA(mfaParams);

    // Log successful MFA verification
    console.log('MFA verification successful:', {
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
    console.error('MFA error:', {
      requestId,
      sourceIp,
      errorName: error.name,
      errorMessage: error.message,
    });

    // Map AWS Cognito errors to appropriate HTTP status codes
    if (error.name === 'CodeMismatchException') {
      return formatErrorResponse(
        new Error('Invalid MFA code provided'),
        401
      );
    }

    if (error.name === 'ExpiredCodeException') {
      return formatErrorResponse(
        new Error('MFA code has expired. Please request a new code'),
        401
      );
    }

    if (error.name === 'NotAuthorizedException') {
      return formatErrorResponse(
        new Error('Invalid session or MFA code'),
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

    if (error.name === 'UserNotFoundException') {
      return formatErrorResponse(
        new Error('User not found'),
        404
      );
    }

    if (error.name === 'UserNotConfirmedException') {
      return formatErrorResponse(
        new Error('User account is not confirmed. Please verify your email'),
        403
      );
    }

    // Generic server error for unexpected errors
    return formatErrorResponse(
      new Error('An unexpected error occurred during MFA verification'),
      500
    );
  }
}
