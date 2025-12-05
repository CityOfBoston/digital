import CobraClient from './CobraClient';

export interface UpdateMFARequest {
  sAMAccountName: string;
  isUserRegistered: 'TRUE' | 'FALSE';
  mfaemail?: string;
  mfaphone?: string;
}

export interface UpdateMFAResponse {
  message: string;
  updated: {
    mail: boolean;
    telephoneNumber: boolean;
    isUserRegistered: boolean;
  };
}

export class UpdateMFAService {
  private client: CobraClient;
  private readonly UPDATE_MFA_ENDPOINT = '/api/ldap/users/updatemfa';

  constructor(client: CobraClient) {
    this.client = client;
  }

  /**
   * Updates a user's MFA information in LDAP
   * @param userId The user's sAMAccountName
   * @param isRegistered Whether the user is registered for MFA
   * @param email Optional MFA email address
   * @param phone Optional MFA phone number
   */
  async updateMFA(
    userId: string,
    isRegistered: boolean,
    email?: string,
    phone?: string
  ): Promise<UpdateMFAResponse> {
    const requestBody: UpdateMFARequest = {
      sAMAccountName: userId,
      isUserRegistered: isRegistered ? 'TRUE' : 'FALSE',
      ...(email && { mfaemail: email }),
      ...(phone && { mfaphone: phone })
    };

    try {
      const response = await this.client.post<UpdateMFAResponse>(
        this.UPDATE_MFA_ENDPOINT,
        { body: requestBody }
      );

      return response;
    } catch (error) {
      throw new Error(error.message || 'An unexpected error occurred while updating MFA information');
    }
  }
}
