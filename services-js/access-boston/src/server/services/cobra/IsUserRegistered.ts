import CobraClient from './CobraClient';

export interface IsUserRegisteredArgs {
  sAMAccountName: string;
  isUserRegistered: string;
}

export interface IsUserRegisteredResponse {
  success: boolean;
  message?: string;
}

export default class IsUserRegistered {
  private client: CobraClient;

  constructor(client: CobraClient) {
    this.client = client;
  }

  async process(args: IsUserRegisteredArgs): Promise<IsUserRegisteredResponse> {
    try {
      const response = await this.client.isUserRegistered(args);
      return {
        success: true,
        message: response.message || 'User registration status checked successfully'
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to check user registration status'
      };
    }
  }
}
