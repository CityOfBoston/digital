import CobraClient from './CobraClient';

export interface IsUserRegisteredArgs {
  SAMACCOUNTNAME: string;
  ISUSERREGISTERED: string;
}

export interface IsUserRegisteredResponse {
  success: boolean;
  message?: string;
}

/**
 * Service to set the user registration status in LDAP after successful MFA enrollment.
 * This marks the user as having completed MFA registration.
 */
export class IsUserRegisteredService {
  private client: CobraClient;
  private readonly IS_USER_REGISTERED_ENDPOINT = '/api/ldap/users/isUserRegistered';

  constructor(client: CobraClient) {
    this.client = client;
  }

  /**
   * Set the user registration status to TRUE after successful MFA enrollment
   * @param userId - The SAMACCOUNTNAME of the user
   */
  async setUserRegistered(userId: string): Promise<IsUserRegisteredResponse> {
    try {
      const response = await this.client.post<any>(this.IS_USER_REGISTERED_ENDPOINT, {
        body: {
          SAMACCOUNTNAME: userId,
          ISUSERREGISTERED: 'TRUE'
        }
      });
      
      return {
        success: true,
        message: response.message || 'User registration status set successfully'
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
        message: 'Failed to set user registration status'
      };
    }
  }
}
