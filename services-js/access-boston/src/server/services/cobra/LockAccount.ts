import CobraClient from './CobraClient';

export interface LockAccountArgs {
  SAMACCOUNTNAME: string;
  lockaccount: string;
}

export interface LockAccountResponse {
  success: boolean;
  message?: string;
}

export default class LockAccount {
  private client: CobraClient;

  constructor(client: CobraClient) {
    this.client = client;
  }

  async process(args: LockAccountArgs): Promise<LockAccountResponse> {
    try {
      const response = await this.client.lockAccount(args);
      return {
        success: true,
        message: response.message || 'Account lock status updated successfully'
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to update account lock status'
      };
    }
  }
}
