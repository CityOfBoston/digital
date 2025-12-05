import CobraClient from './CobraClient';

export interface EmailCheckRequest {
  email: string;
}

export interface EmailCheckResponse {
  hasConflict: boolean;
  message?: string;
}

export class EmailCheckService {
  private client: CobraClient;
  private readonly CHECK_EMAIL_ENDPOINT = '/api/checkmailconflict';

  constructor(client: CobraClient) {
    this.client = client;
  }

  /**
   * Checks if an email address has any conflicts
   * @param email The email address to check
   */
  async checkEmail(email: string): Promise<EmailCheckResponse> {
    const requestBody: EmailCheckRequest = { email };

    try {
      const response = await this.client.post<EmailCheckResponse>(
        this.CHECK_EMAIL_ENDPOINT,
        { body: requestBody }
      );

      return response;
    } catch (error) {
      return {
        hasConflict: true,
        message: error.message || 'An unexpected error occurred while checking email'
      };
    }
  }
}
