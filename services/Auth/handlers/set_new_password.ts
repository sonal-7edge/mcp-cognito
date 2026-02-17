/**
 * Set New Password Lambda Handler
 * 
 * Handles password changes for authenticated users with AWS Cognito User Pool.
 * 
 * Requirements: 2.5, 2.7, 2.8, 11.1, 11.2, 11.3
 */

import { Cognito, SetPasswordParams } from '../class/Cognito';
import {
  formatErrorResponse,
  formatSuccessResponse,
  validatePassword,
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
 * Set password request body interface
 */
interface SetPasswordRequest {
  username: string;
  previousPassword: string;
  proposedPassword: string;
  session: string;
}

/**
 * Lambda handler for password changes
 * 
 * @param event - API Gateway event
 * @returns API Gateway response with success confirmation
 */
export async function handler(event: APIGatewayEvent): Promise<APIGatewayResponse> {
  const requestId = event.requestContext.requestId;
  const sourceIp = event.requestContext.identity.sourceIp;

  try {
    // Parse request body
    let requestBody: SetPasswordRequest;
    try {
      requestBody = JSON.parse(event.body);
    } catch (error) {
      console.error('Set password error - Invalid JSON:', {
        requestId,
        sourceIp,
        error: 'Failed to parse request body',
      });
      return formatErrorResponse(new Error('Invalid request body: must be valid JSON'), 400);
    }

    // Validate required fields
    if (!requestBody.username || !requestBody.previousPassword || !requestBody.proposedPassword || !requestBody.session) {
      console.error('Set password error - Missing required fields:', {
        requestId,
        sourceIp,
        hasUsername: !!requestBody.username,
        hasPreviousPassword: !!requestBody.previousPassword,
        hasProposedPassword: !!requestBody.proposedPassword,
        hasSession: !!requestBody.session,
      });
      return formatErrorResponse(
        new Error('Missing required fields: username, previousPassword, proposedPassword, and session are required'),
        400
      );
    }

    // Validate new password meets policy requirements
    const passwordValidation = validatePassword(requestBody.proposedPassword);
    if (!passwordValidation.valid) {
      console.error('Set password error - Password validation failed:', {
        requestId,
        sourceIp,
        username: requestBody.username,
        errors: passwordValidation.errors,
      });
      return formatErrorResponse(
        new Error(`Password does not meet requirements: ${passwordValidation.errors.join(', ')}`),
        400
      );
    }

    // Initialize Cognito class with environment variables
    const userPoolId = process.env.USER_POOL_ID;
    const clientId = process.env.CLIENT_ID;
    const region = process.env.REGION || process.env.AWS_REGION || 'us-east-1';

    if (!userPoolId || !clientId) {
      console.error('Set password error - Missing environment variables:', {
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

    // Prepare set password parameters
    const setPasswordParams: SetPasswordParams = {
      username: requestBody.username,
      previousPassword: requestBody.previousPassword,
      proposedPassword: requestBody.proposedPassword,
      session: requestBody.session,
    };

    // Call Cognito setNewPassword
    await cognito.setNewPassword(setPasswordParams);

    // Log successful password change
    console.log('Password change successful:', {
      requestId,
      sourceIp,
      username: requestBody.username,
    });

    // Return success response
    return formatSuccessResponse({
      message: 'Password changed successfully',
    }, 200);

  } catch (error: any) {
    // Log error with context (without sensitive data)
    console.error('Set password error:', {
      requestId,
      sourceIp,
      errorName: error.name,
      errorMessage: error.message,
    });

    // Map AWS Cognito errors to appropriate HTTP status codes
    if (error.name === 'NotAuthorizedException') {
      return formatErrorResponse(
        new Error('Invalid previous password or session'),
        401
      );
    }

    if (error.name === 'InvalidPasswordException') {
      return formatErrorResponse(
        new Error('New password does not meet requirements'),
        400
      );
    }

    if (error.name === 'InvalidParameterException') {
      return formatErrorResponse(
        new Error('Invalid parameter provided'),
        400
      );
    }

    if (error.name === 'LimitExceededException') {
      return formatErrorResponse(
        new Error('Attempt limit exceeded. Please try again later'),
        429
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
      new Error('An unexpected error occurred during password change'),
      500
    );
  }
}
