import CobraClient from './CobraClient';

export interface PwdResetArgs {
  SAMACCOUNTNAME: string;
  pwdreset: string;
}

export interface PwdResetResponse {
  success: boolean;
  message?: string;
}

export default class PwdReset {
  private client: CobraClient;

  constructor(client: CobraClient) {
    this.client = client;
  }

  async process(args: PwdResetArgs): Promise<PwdResetResponse> {
    try {
      const response = await this.client.pwdReset(args);
      return {
        success: true,
        message: response.message || 'Password reset status updated successfully'
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
        message: 'Failed to update password reset status'
      };
    }
  }
}
