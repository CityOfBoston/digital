import CobraClient from './CobraClient';

export interface PreferredNameRequest {
  samaccountname: string;
  cobPreferredFirstname: string;
  cobPreferredLastname: string;
  preferredEmail?: string;  // Optional - omit when keeping current email
  type: 'preferred_name';
}

export interface PreferredNameErrorResponse {
  error: string;
  message: string;
}

export interface PreferredNameSuccessResponse {
  message: string;
  requestId: string;
}

export type PreferredNameResponse = PreferredNameSuccessResponse | PreferredNameErrorResponse;

export class PreferredNameService {
  private client: CobraClient;
  private readonly CHANGE_PREF_NAME_ENDPOINT = '/api/changeprefname';

  constructor(client: CobraClient) {
    this.client = client;
  }

  /**
   * Changes a user's preferred name
   * @param userId The user's ID (samaccountname)
   * @param firstName Preferred first name
   * @param lastName Preferred last name
   * @param email Optional preferred email (omit to keep current email unchanged)
   */
  async changePreferredName(
    userId: string,
    firstName: string,
    lastName: string,
    email?: string
  ): Promise<PreferredNameResponse> {
    const requestBody: PreferredNameRequest = {
      samaccountname: userId,
      cobPreferredFirstname: firstName,
      cobPreferredLastname: lastName,
      type: 'preferred_name'
    };

    // Only include preferredEmail if a new email is provided
    if (email && email.length > 0) {
      requestBody.preferredEmail = email;
    }
    // If email is not provided or empty, omit the field entirely

    try {
      const response = await this.client.post<PreferredNameResponse>(
        this.CHANGE_PREF_NAME_ENDPOINT,
        { body: requestBody }
      );

      return response;
    } catch (error) {
      return {
        error: 'UnexpectedError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred while changing preferred name'
      };
    }
  }
}
