import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  ChangePasswordCommand,
  ConfirmForgotPasswordCommand,
  ForgotPasswordCommand,
  AuthFlowType,
  ChallengeNameType,
} from '@aws-sdk/client-cognito-identity-provider';

// Configuration interface
export interface CognitoConfig {
  userPoolId: string;
  clientId: string;
  region: string;
}

// SignUp interfaces
export interface SignUpParams {
  username: string;
  password: string;
  email: string;
  attributes?: Record<string, string>;
}

export interface SignUpResponse {
  userSub: string;
  codeDeliveryDetails: {
    destination: string;
    deliveryMedium: string;
    attributeName: string;
  };
}

// Verification interface
export interface VerifyCodeParams {
  username: string;
  code: string;
}

// Login interfaces
export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

// MFA interface
export interface MFAParams {
  session: string;
  mfaCode: string;
  username: string;
}

// Password management interfaces
export interface SetPasswordParams {
  username: string;
  previousPassword: string;
  proposedPassword: string;
  session: string;
}

export interface ResetPasswordParams {
  username: string;
  code: string;
  newPassword: string;
}

/**
 * Cognito class encapsulating AWS Cognito operations
 */
export class Cognito {
  private config: CognitoConfig;
  private cognitoClient: CognitoIdentityProviderClient;

  constructor(config: CognitoConfig) {
    this.config = config;
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: config.region,
    });
  }

  /**
   * Sign up a new user
   */
  async signUp(params: SignUpParams): Promise<SignUpResponse> {
    const userAttributes = [
      {
        Name: 'email',
        Value: params.email,
      },
    ];

    // Add additional attributes if provided
    if (params.attributes) {
      for (const [key, value] of Object.entries(params.attributes)) {
        userAttributes.push({
          Name: key,
          Value: value,
        });
      }
    }

    const command = new SignUpCommand({
      ClientId: this.config.clientId,
      Username: params.username,
      Password: params.password,
      UserAttributes: userAttributes,
    });

    const response = await this.cognitoClient.send(command);

    return {
      userSub: response.UserSub!,
      codeDeliveryDetails: {
        destination: response.CodeDeliveryDetails?.Destination || '',
        deliveryMedium: response.CodeDeliveryDetails?.DeliveryMedium || '',
        attributeName: response.CodeDeliveryDetails?.AttributeName || '',
      },
    };
  }

  /**
   * Verify user with confirmation code
   */
  async verifyCode(params: VerifyCodeParams): Promise<void> {
    const command = new ConfirmSignUpCommand({
      ClientId: this.config.clientId,
      Username: params.username,
      ConfirmationCode: params.code,
    });

    await this.cognitoClient.send(command);
  }

  /**
   * Login user with username and password
   */
  async login(params: LoginParams): Promise<LoginResponse> {
    const command = new InitiateAuthCommand({
      ClientId: this.config.clientId,
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: params.username,
        PASSWORD: params.password,
      },
    });

    const response = await this.cognitoClient.send(command);

    // Check if MFA is required
    if (response.ChallengeName) {
      throw new Error(`MFA_REQUIRED:${response.Session}`);
    }

    return {
      accessToken: response.AuthenticationResult?.AccessToken || '',
      idToken: response.AuthenticationResult?.IdToken || '',
      refreshToken: response.AuthenticationResult?.RefreshToken || '',
      expiresIn: response.AuthenticationResult?.ExpiresIn || 0,
      tokenType: response.AuthenticationResult?.TokenType || 'Bearer',
    };
  }

  /**
   * Confirm MFA challenge
   */
  async confirmMFA(params: MFAParams): Promise<LoginResponse> {
    const command = new RespondToAuthChallengeCommand({
      ClientId: this.config.clientId,
      ChallengeName: ChallengeNameType.SMS_MFA,
      Session: params.session,
      ChallengeResponses: {
        USERNAME: params.username,
        SMS_MFA_CODE: params.mfaCode,
      },
    });

    const response = await this.cognitoClient.send(command);

    return {
      accessToken: response.AuthenticationResult?.AccessToken || '',
      idToken: response.AuthenticationResult?.IdToken || '',
      refreshToken: response.AuthenticationResult?.RefreshToken || '',
      expiresIn: response.AuthenticationResult?.ExpiresIn || 0,
      tokenType: response.AuthenticationResult?.TokenType || 'Bearer',
    };
  }

  /**
   * Set new password for authenticated user
   */
  async setNewPassword(params: SetPasswordParams): Promise<void> {
    const command = new ChangePasswordCommand({
      PreviousPassword: params.previousPassword,
      ProposedPassword: params.proposedPassword,
      AccessToken: params.session,
    });

    await this.cognitoClient.send(command);
  }

  /**
   * Reset password with confirmation code
   */
  async resetPassword(params: ResetPasswordParams): Promise<void> {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: this.config.clientId,
      Username: params.username,
      ConfirmationCode: params.code,
      Password: params.newPassword,
    });

    await this.cognitoClient.send(command);
  }

  /**
   * Initiate password reset flow
   */
  async initiatePasswordReset(username: string): Promise<void> {
    const command = new ForgotPasswordCommand({
      ClientId: this.config.clientId,
      Username: username,
    });

    await this.cognitoClient.send(command);
  }
}
