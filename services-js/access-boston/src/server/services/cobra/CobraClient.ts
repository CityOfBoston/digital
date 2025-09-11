import fetch from 'node-fetch';

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

/**
 * Client for making HTTP calls to Cobra endpoints.
 * All endpoints are synchronous and use Bearer token authentication.
 */
export default class CobraClient {
  private baseUrl: string;
  private bearerToken: string;
  private defaultTimeout: number;

  constructor() {
    const httpMethod = process.env.COBRA_HTTP_METHOD;
    const hostname = process.env.COBRA_HOSTNAME;
    const port = process.env.COBRA_PORT;
    const token = process.env.COBRA_AUTH_TOKEN;
    const timeout = process.env.COBRA_REQUEST_TIMEOUT;

    if (!httpMethod) {
      throw new Error('COBRA_HTTP_METHOD not provided');
    }

    if (!hostname) {
      throw new Error('COBRA_HOSTNAME not provided');
    }

    if (!port) {
      throw new Error('COBRA_PORT not provided');
    }

    if (!token) {
      throw new Error('COBRA_AUTH_TOKEN not provided');
    }

    this.baseUrl = `${httpMethod}://${hostname}:${port}`;
    this.bearerToken = token;
    this.defaultTimeout = timeout ? parseInt(timeout, 10) : 30000; // Default 30s timeout
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
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined,
        timeout // node-fetch supports timeout option
      });

      if (!response.ok) {
        let errorData: CobraErrorResponse;
        try {
          errorData = await response.json();
          throw new Error(errorData.message || `Cobra API error: ${response.statusText}`);
        } catch (e) {
          throw new Error(`Cobra API error: ${response.statusText}`);
        }
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        return response.json();
      }
      return {} as T;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Cobra API request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }
}
