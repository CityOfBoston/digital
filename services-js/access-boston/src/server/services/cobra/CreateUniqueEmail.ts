import CobraClient, { CreateUniqueEmailArgs, CreateUniqueEmailResponse } from './CobraClient';

export default class CreateUniqueEmail {
  private client: CobraClient;

  constructor(client: CobraClient) {
    this.client = client;
  }

  async process(args: CreateUniqueEmailArgs): Promise<CreateUniqueEmailResponse> {
    try {
      const response = await this.client.createUniqueEmail(args);
      return {
        available: response.available,
        message: response.message,
        email: response.email
      };
    } catch (err) {
      // Parse the error response from Cobra
      if (err instanceof Error) {
        try {
          const errorBody = JSON.parse(err.message);
          return {
            available: false,
            message: errorBody.message || errorBody.error || err.message,
            email: ''
          };
        } catch {
          // If parsing fails, return the original error message
          return {
            available: false,
            message: err.message,
            email: ''
          };
        }
      }
      return {
        available: false,
        message: 'Failed to check email availability',
        email: ''
      };
    }
  }
}
