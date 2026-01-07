import CobraClient from './CobraClient';

export interface OtpAuthRequiredArgs {
  SAMACCOUNTNAME: string;
  otpauthrequired: string;
}

export interface OtpAuthRequiredResponse {
  success: boolean;
  message?: string;
}

export default class OtpAuthRequired {
  private client: CobraClient;

  constructor(client: CobraClient) {
    this.client = client;
  }

  async process(args: OtpAuthRequiredArgs): Promise<OtpAuthRequiredResponse> {
    try {
      const response = await this.client.otpAuthRequired(args);
      return {
        success: true,
        message: response.message || 'OTP authentication requirement updated successfully'
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to update OTP authentication requirement'
      };
    }
  }
}
