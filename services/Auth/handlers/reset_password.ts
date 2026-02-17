/**
 * Reset Password Lambda Handler
 * 
 * Handles password reset flow with AWS Cognito User Pool.
 * Supports two operations:
 * 1. Initiate reset: Sends verification code to user's email
 * 2. Confirm reset: Resets password with verification code
 * 
 * Requirements: 2.6, 2.7, 2.8, 11.1, 11.2, 11.3
 */

import { Cognito, ResetPasswordParams } from '../class/Cognito';
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
 * Initiate reset request body interface
 */
interface InitiateResetRequest {
  operation: 'initiate';
  username: string;
}

/**
 * Confirm reset request body interface
 */
interface ConfirmResetRequest {
  operation: 'confirm';
  username: string;
  code: string;
  newPassword: string;
}

/**
 * Combined reset request type
 */
type ResetPasswordRequest = InitiateResetRequest | ConfirmResetRequest;

/**
 * Lambda handler for password reset
 * 
 * @param event - API Gateway event
 * @returns API Gateway response with success confirmation
 */
export async function handler(event: APIGatewayEvent): Promise<APIGatewayResponse> {
  const requestId = event.requestContext.requestId;
  const sourceIp = event.requestContext.identity.sourceIp;

  try {
    // Parse request body
    let requestBody: ResetPasswordRequest;
    try {
      requestBody = JSON.parse(event.body);
    } catch (error) {
      console.error('Reset password error - Invalid JSON:', {
        requestId,
        sourceIp,
        error: 'Failed to parse request body',
      });
      return formatErrorResponse(new Error('Invalid request body: must be valid JSON'), 400);
    }

    // Validate operation field
    const operation = (requestBody as any).operation;
    if (!operation || (operation !== 'initiate' && operation !== 'confirm')) {
      console.error('Reset password error - Invalid operation:', {
        requestId,
        sourceIp,
        operation: operation,
      });
      return formatErrorResponse(
        new Error('Invalid operation: must be "initiate" or "confirm"'),
        400
      );
    }

    // Validate username is present
    const username = (requestBody as any).username;
    if (!username) {
      console.error('Reset password error - Missing username:', {
        requestId,
        sourceIp,
        operation: operation,
      });
      return formatErrorResponse(
        new Error('Missing required field: username is required'),
        400
      );
    }

    // Initialize Cognito class with environment variables
    const userPoolId = process.env.USER_POOL_ID;
    const clientId = process.env.CLIENT_ID;
    const region = process.env.REGION || process.env.AWS_REGION || 'us-east-1';

    if (!userPoolId || !clientId) {
      console.error('Reset password error - Missing environment variables:', {
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

    // Handle initiate operation
    if (operation === 'initiate') {
      // Call Cognito initiatePasswordReset
      await cognito.initiatePasswordReset(username);

      // Log successful initiation
      console.log('Password reset initiated:', {
        requestId,
        sourceIp,
        username: username,
      });

      // Return success response
      return formatSuccessResponse({
        message: 'Password reset code sent successfully',
      }, 200);
    }

    // Handle confirm operation
    if (operation === 'confirm') {
      const code = (requestBody as any).code;
      const newPassword = (requestBody as any).newPassword;
      
      // Validate required fields for confirm operation
      if (!code || !newPassword) {
        console.error('Reset password error - Missing required fields for confirm:', {
          requestId,
          sourceIp,
          username: username,
          hasCode: !!code,
          hasNewPassword: !!newPassword,
        });
        return formatErrorResponse(
          new Error('Missing required fields: code and newPassword are required for confirm operation'),
          400
        );
      }

      // Validate new password meets policy requirements
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        console.error('Reset password error - Password validation failed:', {
          requestId,
          sourceIp,
          username: username,
          errors: passwordValidation.errors,
        });
        return formatErrorResponse(
          new Error(`Password does not meet requirements: ${passwordValidation.errors.join(', ')}`),
          400
        );
      }

      // Prepare reset password parameters
      const resetPasswordParams: ResetPasswordParams = {
        username: username,
        code: code,
        newPassword: newPassword,
      };

      // Call Cognito resetPassword
      await cognito.resetPassword(resetPasswordParams);

      // Log successful password reset
      console.log('Password reset confirmed:', {
        requestId,
        sourceIp,
        username: username,
      });

      // Return success response
      return formatSuccessResponse({
        message: 'Password reset successfully',
      }, 200);
    }

    // This should never be reached due to earlier validation
    return formatErrorResponse(
      new Error('Invalid operation'),
      400
    );

  } catch (error: any) {
    // Log error with context (without sensitive data)
    console.error('Reset password error:', {
      requestId,
      sourceIp,
      errorName: error.name,
      errorMessage: error.message,
    });

    // Map AWS Cognito errors to appropriate HTTP status codes
    if (error.name === 'UserNotFoundException') {
      return formatErrorResponse(
        new Error('User not found'),
        404
      );
    }

    if (error.name === 'CodeMismatchException') {
      return formatErrorResponse(
        new Error('Invalid verification code'),
        400
      );
    }

    if (error.name === 'ExpiredCodeException') {
      return formatErrorResponse(
        new Error('Verification code has expired. Please request a new code'),
        400
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

    if (error.name === 'TooManyFailedAttemptsException') {
      return formatErrorResponse(
        new Error('Too many failed attempts. Please try again later'),
        429
      );
    }

    if (error.name === 'NotAuthorizedException') {
      return formatErrorResponse(
        new Error('Password reset not authorized for this user'),
        403
      );
    }

    if (error.name === 'UserNotConfirmedException') {
      return formatErrorResponse(
        new Error('User account is not confirmed. Please verify your email first'),
        403
      );
    }

    // Generic server error for unexpected errors
    return formatErrorResponse(
      new Error('An unexpected error occurred during password reset'),
      500
    );
  }
}
