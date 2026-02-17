/**
 * Unit tests for reset_password handler
 */

import { handler } from './reset_password';
import { Cognito } from '../class/Cognito';

// Mock the Cognito class
jest.mock('../class/Cognito');

describe('Reset Password Handler', () => {
  const mockRequestContext = {
    requestId: 'test-request-id',
    identity: {
      sourceIp: '127.0.0.1',
    },
  };

  const mockEvent = {
    body: '',
    headers: {},
    requestContext: mockRequestContext,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.USER_POOL_ID = 'test-pool-id';
    process.env.CLIENT_ID = 'test-client-id';
    process.env.REGION = 'us-east-1';
  });

  describe('Initiate Password Reset', () => {
    it('should successfully initiate password reset', async () => {
      const mockInitiatePasswordReset = jest.fn().mockResolvedValue(undefined);
      (Cognito as jest.MockedClass<typeof Cognito>).mockImplementation(() => ({
        initiatePasswordReset: mockInitiatePasswordReset,
      } as any));

      const event = {
        ...mockEvent,
        body: JSON.stringify({
          operation: 'initiate',
          username: 'testuser',
        }),
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(mockInitiatePasswordReset).toHaveBeenCalledWith('testuser');
      
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Password reset code sent successfully');
    });

    it('should return 400 for missing username', async () => {
      const event = {
        ...mockEvent,
        body: JSON.stringify({
          operation: 'initiate',
        }),
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.message).toContain('username is required');
    });

    it('should return 404 for user not found', async () => {
      const mockError = new Error('User not found');
      (mockError as any).name = 'UserNotFoundException';
      
      const mockInitiatePasswordReset = jest.fn().mockRejectedValue(mockError);
      (Cognito as jest.MockedClass<typeof Cognito>).mockImplementation(() => ({
        initiatePasswordReset: mockInitiatePasswordReset,
      } as any));

      const event = {
        ...mockEvent,
        body: JSON.stringify({
          operation: 'initiate',
          username: 'nonexistent',
        }),
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error.message).toBe('User not found');
    });
  });

  describe('Confirm Password Reset', () => {
    it('should successfully confirm password reset', async () => {
      const mockResetPassword = jest.fn().mockResolvedValue(undefined);
      (Cognito as jest.MockedClass<typeof Cognito>).mockImplementation(() => ({
        resetPassword: mockResetPassword,
      } as any));

      const event = {
        ...mockEvent,
        body: JSON.stringify({
          operation: 'confirm',
          username: 'testuser',
          code: '123456',
          newPassword: 'NewSecurePass123!',
        }),
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(mockResetPassword).toHaveBeenCalledWith({
        username: 'testuser',
        code: '123456',
        newPassword: 'NewSecurePass123!',
      });
      
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Password reset successfully');
    });

    it('should return 400 for missing code', async () => {
      const event = {
        ...mockEvent,
        body: JSON.stringify({
          operation: 'confirm',
          username: 'testuser',
          newPassword: 'NewSecurePass123!',
        }),
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.message).toContain('code and new[REDACTED] are required');
    });

    it('should return 400 for missing newPassword', async () => {
      const event = {
        ...mockEvent,
        body: JSON.stringify({
          operation: 'confirm',
          username: 'testuser',
          code: '123456',
        }),
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.message).toContain('code and new[REDACTED] are required');
    });

    it('should return 400 for weak password', async () => {
      const event = {
        ...mockEvent,
        body: JSON.stringify({
          operation: 'confirm',
          username: 'testuser',
          code: '123456',
          newPassword: 'weak',
        }),
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.message).toContain('[REDACTED] does not meet requirements');
    });

    it('should return 400 for invalid verification code', async () => {
      const mockError = new Error('Invalid verification code');
      (mockError as any).name = 'CodeMismatchException';
      
      const mockResetPassword = jest.fn().mockRejectedValue(mockError);
      (Cognito as jest.MockedClass<typeof Cognito>).mockImplementation(() => ({
        resetPassword: mockResetPassword,
      } as any));

      const event = {
        ...mockEvent,
        body: JSON.stringify({
          operation: 'confirm',
          username: 'testuser',
          code: 'wrong-code',
          newPassword: 'NewSecurePass123!',
        }),
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.message).toBe('Invalid verification code');
    });

    it('should return 400 for expired code', async () => {
      const mockError = new Error('Code expired');
      (mockError as any).name = 'ExpiredCodeException';
      
      const mockResetPassword = jest.fn().mockRejectedValue(mockError);
      (Cognito as jest.MockedClass<typeof Cognito>).mockImplementation(() => ({
        resetPassword: mockResetPassword,
      } as any));

      const event = {
        ...mockEvent,
        body: JSON.stringify({
          operation: 'confirm',
          username: 'testuser',
          code: 'expired-code',
          newPassword: 'NewSecurePass123!',
        }),
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.message).toContain('expired');
    });
  });

  describe('Request Validation', () => {
    it('should return 400 for invalid JSON', async () => {
      const event = {
        ...mockEvent,
        body: 'invalid json',
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.message).toContain('Invalid request body');
    });

    it('should return 400 for missing operation', async () => {
      const event = {
        ...mockEvent,
        body: JSON.stringify({
          username: 'testuser',
        }),
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.message).toContain('Invalid operation');
    });

    it('should return 400 for invalid operation', async () => {
      const event = {
        ...mockEvent,
        body: JSON.stringify({
          operation: 'invalid',
          username: 'testuser',
        }),
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.message).toContain('Invalid operation');
    });

    it('should return 500 for missing environment variables', async () => {
      delete process.env.USER_POOL_ID;

      const event = {
        ...mockEvent,
        body: JSON.stringify({
          operation: 'initiate',
          username: 'testuser',
        }),
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.error.message).toContain('Server configuration error');
    });
  });

  describe('Error Handling', () => {
    it('should return 429 for too many requests', async () => {
      const mockError = new Error('Too many requests');
      (mockError as any).name = 'TooManyRequestsException';
      
      const mockInitiatePasswordReset = jest.fn().mockRejectedValue(mockError);
      (Cognito as jest.MockedClass<typeof Cognito>).mockImplementation(() => ({
        initiatePasswordReset: mockInitiatePasswordReset,
      } as any));

      const event = {
        ...mockEvent,
        body: JSON.stringify({
          operation: 'initiate',
          username: 'testuser',
        }),
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(429);
      const body = JSON.parse(response.body);
      expect(body.error.message).toContain('Too many requests');
    });

    it('should return 500 for unexpected errors', async () => {
      const mockError = new Error('Unexpected error');
      
      const mockInitiatePasswordReset = jest.fn().mockRejectedValue(mockError);
      (Cognito as jest.MockedClass<typeof Cognito>).mockImplementation(() => ({
        initiatePasswordReset: mockInitiatePasswordReset,
      } as any));

      const event = {
        ...mockEvent,
        body: JSON.stringify({
          operation: 'initiate',
          username: 'testuser',
        }),
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.error.message).toContain('unexpected error');
    });

    it('should not expose sensitive data in error messages', async () => {
      const mockError = new Error('Database connection failed with password: secret123');
      
      const mockResetPassword = jest.fn().mockRejectedValue(mockError);
      (Cognito as jest.MockedClass<typeof Cognito>).mockImplementation(() => ({
        resetPassword: mockResetPassword,
      } as any));

      const event = {
        ...mockEvent,
        body: JSON.stringify({
          operation: 'confirm',
          username: 'testuser',
          code: '123456',
          newPassword: 'NewSecurePass123!',
        }),
      };

      const response = await handler(event);

      const body = JSON.parse(response.body);
      // Should return generic error message with password redacted
      expect(body.error.message).toBe('An unexpected error occurred during [REDACTED] reset');
      expect(body.error.message).not.toContain('secret123');
      expect(body.error.message).not.toContain('NewSecurePass123!');
    });
  });
});
