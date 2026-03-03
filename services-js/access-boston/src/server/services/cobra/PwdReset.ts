import CobraClient from './CobraClient';

export interface PwdResetArgs {
  SAMACCOUNTNAME: string;
  PWDRESET: string;
}

export interface PwdResetResponse {
  success: boolean;
  message?: string;
}

/**
 * Service to update the pwdreset flag in LDAP after a successful password change.
 * This clears the "password reset required" flag set by administrators.
 */
export class PwdResetService {
  private client: CobraClient;
  private readonly PWD_RESET_ENDPOINT = '/api/ldap/users/pwdreset';

  constructor(client: CobraClient) {
    this.client = client;
  }

  /**
   * Clear the password reset flag for a user after successful password change
   * @param userId - The SAMACCOUNTNAME of the user
   */
  async clearPwdResetFlag(userId: string): Promise<PwdResetResponse> {
    try {
      const response = await this.client.post<any>(this.PWD_RESET_ENDPOINT, {
        body: {
          SAMACCOUNTNAME: userId,
          PWDRESET: 'FALSE'
        }
      });
      
      return {
        success: true,
        message: response.message || 'Password reset flag cleared successfully'
      };
    } catch (err) {
      // Parse the error response from Cobra
      if (err instanceof Error) {
        try {
          const errorBody = JSON.parse(err.message);
          return {
            success: false,
            message: errorBody.message || errorBody.error || err.message
          };
        } catch {
          // If parsing fails, return the original error message
          return {
            success: false,
            message: err.message
          };
        }
      }
      return {
        success: false,
        message: 'Failed to clear password reset flag'
      };
    }
  }
}
