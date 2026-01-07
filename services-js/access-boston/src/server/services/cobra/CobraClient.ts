import fetch from 'node-fetch';
import * as https from 'https';

/**
 * Interface for request options
 */
export interface CobraRequestOptions {
  queryParams?: Record<string, string>;
  body?: Record<string, any>;
  timeout?: number;
}

/**
 * Generic error response from Cobra API
 */
export interface CobraErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export interface CreateUniqueEmailArgs {
  firstName: string;
  lastName: string;
}

export interface CreateUniqueEmailResponse {
  available: boolean;
  message: string;
  email: string;
}

export interface GetUserDetailsArgs {
  samaccountname: string;
}

export interface IsUserRegisteredArgs {
  sAMAccountName: string;
  isUserRegistered: string;
}

export interface OtpAuthRequiredArgs {
  SAMACCOUNTNAME: string;
  otpauthrequired: string;
}

export interface PwdResetArgs {
  SAMACCOUNTNAME: string;
  pwdreset: string;
}

export interface LockAccountArgs {
  SAMACCOUNTNAME: string;
  lockaccount: string;
}

/**
 * Client for making HTTP calls to Cobra endpoints.
 * All endpoints are synchronous and use Bearer token authentication.
 */
export default class CobraClient {
  private baseUrl: string;
  private bearerToken: string;
  private defaultTimeout: number;
  private httpsAgent: https.Agent | undefined;

  constructor() {
    const httpMethod = process.env.COBRA_HTTP_METHOD;
    const hostname = process.env.COBRA_HOSTNAME;
    const port = process.env.COBRA_HOST_PORT;
    const token = process.env.COBRA_JWT_TOKEN;
    if (!httpMethod) {
      throw new Error('COBRA_HTTP_METHOD not provided');
    }

    if (!hostname) {
      throw new Error('COBRA_HOSTNAME not provided');
    }

    if (!port) {
      throw new Error('COBRA_HOST_PORT not provided');
    }

    if (!token) {
      throw new Error('COBRA_JWT_TOKEN not provided');
    }

    this.baseUrl = `${httpMethod}://${hostname}:${port}`;
    this.bearerToken = token;
    this.defaultTimeout = 30000; // Default 30s timeout
    
    // Create HTTPS agent with SSL verification options
    // Set COBRA_REJECT_UNAUTHORIZED=false to bypass SSL verification (like curl -k)
    if (httpMethod === 'https') {
      this.httpsAgent = new https.Agent({
        rejectUnauthorized: false
      });
      console.warn('[CobraClient] SSL certificate verification is DISABLED. This should only be used in development/testing.');
    }
  }

  /**
   * Makes a GET request to the Cobra API
   * @param endpoint The API endpoint path
   * @param options Request options including query parameters
   */
  async get<T>(endpoint: string, options: CobraRequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint, options.queryParams);
    return this.makeRequest<T>(url, 'GET', options);
  }

  /**
   * Makes a POST request to the Cobra API
   * @param endpoint The API endpoint path
   * @param options Request options including body and query parameters
   */
  async post<T>(endpoint: string, options: CobraRequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint, options.queryParams);
    return this.makeRequest<T>(url, 'POST', options);
  }

  /**
   * Builds the complete URL with query parameters
   */
  private buildUrl(endpoint: string, queryParams?: Record<string, string>): string {
    let url = `${this.baseUrl}${endpoint}`;
    
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams();
      Object.keys(queryParams).forEach(key => {
        const value = queryParams[key];
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });
      url += `?${params.toString()}`;
    }
    
    return url;
  }

  /**
   * Makes the actual HTTP request to the Cobra API
   */
  private async makeRequest<T>(
    url: string,
    method: string,
    options: CobraRequestOptions
  ): Promise<T> {
    const { body, timeout = this.defaultTimeout } = options;

    try {
      console.log(`[CobraClient.makeRequest] ${method} ${url}`);
      console.log('[CobraClient.makeRequest] Body:', body ? JSON.stringify(body) : 'none');
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined,
        timeout, // node-fetch supports timeout option
        agent: this.httpsAgent // Use HTTPS agent for SSL options
      });

      console.log(`[CobraClient.makeRequest] Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMessage: string;
        try {
          // Try to parse as JSON first
          const errorData: CobraErrorResponse = await response.json();
          console.error('[CobraClient.makeRequest] Error response (JSON):', errorData);
          errorMessage = errorData.message || `Cobra API error: ${response.statusText}`;
        } catch (jsonError) {
          // If JSON parsing fails, try to read as text
          try {
            const text = await response.text();
            console.error('[CobraClient.makeRequest] Error response (text):', text);
            errorMessage = text || `Cobra API error: ${response.statusText}`;
          } catch (textError) {
            console.error('[CobraClient.makeRequest] Failed to parse error response:', textError);
            errorMessage = `Cobra API error: ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        const data = await response.json();
        console.log('[CobraClient.makeRequest] Success, received JSON response');
        return data;
      }
      console.log('[CobraClient.makeRequest] Success, no JSON content');
      return {} as T;

    } catch (error) {
      console.error('[CobraClient.makeRequest] Exception:', error);
      if ((error as any).name === 'AbortError') {
        throw new Error(`Cobra API request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  async viewUserInfo(args: { id_or_displayname: string }): Promise<any> {
    return this.post<any>('/api/sailpoint/viewuserinfo', {
      body: args
    });
  }

  async createUniqueEmail(args: CreateUniqueEmailArgs): Promise<CreateUniqueEmailResponse> {
    return this.post<CreateUniqueEmailResponse>('/api/createuniqueemail', {
      body: args
    });
  }

  async getUserDetails(args: GetUserDetailsArgs): Promise<any> {
    return this.post<any>('/api/ping/getuserdetails', {
      body: args
    });
  }

  async isUserRegistered(args: IsUserRegisteredArgs): Promise<any> {
    return this.post<any>('/api/isuserregistered', {
      body: args
    });
  }

  async otpAuthRequired(args: OtpAuthRequiredArgs): Promise<any> {
    return this.post<any>('/api/otpauthrequired', {
      body: args
    });
  }

  async pwdReset(args: PwdResetArgs): Promise<any> {
    return this.post<any>('/api/pwdreset', {
      body: args
    });
  }

  async lockAccount(args: LockAccountArgs): Promise<any> {
    return this.post<any>('/api/lockaccount', {
      body: args
    });
  }
}
