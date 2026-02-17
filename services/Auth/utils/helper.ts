/**
 * Helper Utilities for Cognito Auth Package
 * 
 * This module provides utility functions for password validation, email validation,
 * response formatting, attribute conversion, and JWT parsing.
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates password against policy requirements
 * Requirements: minimum 12 characters, uppercase, lowercase, numbers, symbols
 * 
 * @param password - Password to validate
 * @returns ValidationResult with valid flag and error messages
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password || password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain numbers');
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain symbols');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates email format
 * 
 * @param email - Email address to validate
 * @returns true if email format is valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  if (!email) {
    return false;
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formats error response for API Gateway
 * 
 * @param error - Error object
 * @param statusCode - HTTP status code (default: 500)
 * @returns API Gateway response object
 */
export function formatErrorResponse(error: Error, statusCode: number = 500): {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
} {
  // Sanitize error message to remove sensitive information
  const sanitizedMessage = error.message
    .replace(/password/gi, '[REDACTED]')
    .replace(/token/gi, '[REDACTED]')
    .replace(/session/gi, '[REDACTED]');

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      error: {
        code: error.name || 'InternalError',
        message: sanitizedMessage
      }
    })
  };
}

/**
 * Formats success response for API Gateway
 * 
 * @param data - Response data
 * @param statusCode - HTTP status code (default: 200)
 * @returns API Gateway response object
 */
export function formatSuccessResponse(data: any, statusCode: number = 200): {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
} {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(data)
  };
}

/**
 * Extracts user attributes from Cognito format to plain object
 * 
 * @param attributes - Array of Cognito attributes
 * @returns Plain object with attribute key-value pairs
 */
export function extractUserAttributes(
  attributes: Array<{ Name: string; Value: string }>
): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const attr of attributes) {
    result[attr.Name] = attr.Value;
  }
  
  return result;
}

/**
 * Converts plain object to Cognito attribute format
 * 
 * @param attributes - Plain object with attribute key-value pairs
 * @returns Array of Cognito attributes
 */
export function toCognitoAttributes(
  attributes: Record<string, string>
): Array<{ Name: string; Value: string }> {
  return Object.entries(attributes).map(([key, value]) => ({
    Name: key,
    Value: value
  }));
}

/**
 * Parses JWT token into header, payload, and signature
 * 
 * @param token - JWT token string
 * @returns Object containing decoded header, payload, and signature
 * @throws Error if token format is invalid
 */
export function parseJWT(token: string): {
  header: any;
  payload: any;
  signature: string;
} {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token: token must be a non-empty string');
  }

  const parts = token.split('.');
  
  if (parts.length !== 3) {
    throw new Error('Invalid token: JWT must have three parts');
  }

  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf8'));
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    const signature = parts[2];

    return {
      header,
      payload,
      signature
    };
  } catch (error) {
    throw new Error('Invalid token: failed to decode JWT parts');
  }
}
