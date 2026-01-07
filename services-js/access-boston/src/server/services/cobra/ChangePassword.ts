import CobraClient from './CobraClient';

export interface ChangePasswordRequest {
  samaccountname: string;
  password: string;
  verifypassword: string;
}

export interface ChangePasswordSuccessResponse {
  message: string;
  requestId: string;
}

export interface ChangePasswordErrorResponse {
  error: string;
  message: string;
}

export type ChangePasswordResponse = ChangePasswordSuccessResponse | ChangePasswordErrorResponse;

export class ChangePasswordService {
  private client: CobraClient;
  private readonly ENDPOINT = '/api/sailpoint/changepassword';

  constructor(client: CobraClient) {
    this.client = client;
  }

  /**
   * Changes a user's password using the Cobra API
   * @param userId The user's ID
   * @param newPassword The new password to set
   * @param confirmPassword The confirmation of the new password
   */
  async changePassword(
    userId: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ChangePasswordResponse> {
    const requestBody: ChangePasswordRequest = {
      samaccountname: userId,
      password: newPassword,
      verifypassword: confirmPassword
    };

    try {
      const response = await this.client.post<ChangePasswordResponse>(
        this.ENDPOINT,
        { body: requestBody }
      );

      // Check if it's an error response
      if ('error' in response) {
        return response as ChangePasswordErrorResponse;
      }

      return response as ChangePasswordSuccessResponse;
    } catch (error) {
      // Handle any unexpected errors
      return {
        error: 'UnexpectedError',
        message: error.message || 'An unexpected error occurred while changing password'
      };
    }
  }
}
