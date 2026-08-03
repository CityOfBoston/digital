import * as http2 from 'http2';
import * as https from 'https';
import { URL } from 'url';

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
  userId: string;
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
  SAMACCOUNTNAME: string;
  ISUSERREGISTERED: string;
}

export interface OtpAuthRequiredArgs {
  SAMACCOUNTNAME: string;
  otpauthrequired: string;
}

export interface PwdResetArgs {
  SAMACCOUNTNAME: string;
  PWDRESET: string;
}

export interface LockAccountArgs {
  SAMACCOUNTNAME: string;
  lockaccount: string;
}

/**
 * Read a header value case-insensitively.
 * HTTP/2 lowercases header names; this also tolerates mixed-case maps.
 */
export function getHeaderValue(
  headers:
    | http2.IncomingHttpHeaders
    | Record<string, string | string[] | undefined>,
  name: string
): string | undefined {
  const lower = name.toLowerCase();
  const direct = headers[lower];
  if (direct !== undefined) {
    return Array.isArray(direct) ? direct[0] : direct;
  }

  const keys = Object.keys(headers);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key.toLowerCase() === lower) {
      const value = headers[key];
      if (value === undefined) {
        return undefined;
      }
      return Array.isArray(value) ? value[0] : value;
    }
  }

  return undefined;
}

interface CobraHttpResponse {
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  rawBody: string;
  protocol: 'h2' | 'http1.1';
}

/**
 * Client for making HTTP calls to Cobra endpoints.
 * Prefers HTTP/2 (Cloudflare-ready), falls back to HTTP/1.1 when the
 * endpoint does not negotiate h2. Request/response headers are handled
 * in a lowercase-safe way on both paths.
 */
export default class CobraClient {
  private baseUrl: string;
  private bearerToken: string;
  private defaultTimeout: number;

  constructor() {
    const httpMethod = process.env.COBRA_HTTP_METHOD;
    const hostname = process.env.COBRA_HOSTNAME;
    const port = process.env.COBRA_HOST_PORT;
    const token = process.env.COBRA_JWT_TOKEN;
    if (!httpMethod) {
      throw new Error('COBRA_HTTP_METHOD not provided');
    }

    if (httpMethod !== 'https') {
      throw new Error(
        'COBRA_HTTP_METHOD must be "https" (TLS is required for Cloudflare compatibility)'
      );
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

    // SSL verification is disabled (like curl -k) to match prior Cobra client behavior.
    console.warn(
      '[CobraClient] SSL certificate verification is DISABLED. This should only be used in development/testing.'
    );
  }

  /**
   * Makes a GET request to the Cobra API
   * @param endpoint The API endpoint path
   * @param options Request options including query parameters
   */
  async get<T>(
    endpoint: string,
    options: CobraRequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint, options.queryParams);
    return this.makeRequest<T>(url, 'GET', options);
  }

  /**
   * Makes a POST request to the Cobra API
   * @param endpoint The API endpoint path
   * @param options Request options including body and query parameters
   */
  async post<T>(
    endpoint: string,
    options: CobraRequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint, options.queryParams);
    return this.makeRequest<T>(url, 'POST', options);
  }

  /**
   * Builds the complete URL with query parameters
   */
  private buildUrl(
    endpoint: string,
    queryParams?: Record<string, string>
  ): string {
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
   * Shared lowercase request headers for both HTTP/2 and HTTP/1.1.
   */
  private buildRequestHeaders(
    bodyString: string | undefined
  ): Record<string, string | number> {
    const headers: Record<string, string | number> = {
      authorization: `Bearer ${this.bearerToken}`,
      accept: 'application/json',
    };

    if (bodyString !== undefined) {
      headers['content-type'] = 'application/json';
      headers['content-length'] = Buffer.byteLength(bodyString);
    }

    return headers;
  }

  /**
   * Performs a single HTTP/2 request and tears down the session afterward.
   */
  private http2Request(
    authority: string,
    method: string,
    path: string,
    bodyString: string | undefined,
    timeout: number
  ): Promise<CobraHttpResponse> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const session = http2.connect(authority, {
        rejectUnauthorized: false,
      });

      const cleanup = () => {
        try {
          if (!session.destroyed) {
            session.destroy();
          }
        } catch (cleanupError) {
          // ignore cleanup errors
        }
      };

      const fail = (err: Error) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        cleanup();
        reject(err);
      };

      const succeed = (result: CobraHttpResponse) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        cleanup();
        resolve(result);
      };

      const timer = setTimeout(() => {
        fail(new Error(`Cobra API request timeout after ${timeout}ms`));
      }, timeout);

      session.on('error', (err: Error) => {
        fail(err);
      });

      // HTTP/2 requires lowercase header names.
      const reqHeaders: http2.OutgoingHttpHeaders = {
        ':method': method,
        ':path': path,
        ...this.buildRequestHeaders(bodyString),
      };

      const req = session.request(reqHeaders);

      req.setTimeout(timeout, () => {
        req.rstWithCancel();
        fail(new Error(`Cobra API request timeout after ${timeout}ms`));
      });

      req.on('response', (headers: http2.IncomingHttpHeaders) => {
        const statusHeader = headers[':status'];
        const statusCode =
          typeof statusHeader === 'number'
            ? statusHeader
            : parseInt(String(statusHeader || '0'), 10) || 0;

        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer | string) => {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        });
        req.on('end', () => {
          const rawBody = Buffer.concat(chunks).toString('utf8');
          succeed({
            statusCode,
            headers: headers as Record<string, string | string[] | undefined>,
            rawBody,
            protocol: 'h2',
          });
        });
      });

      req.on('error', (err: Error) => {
        fail(err);
      });

      if (bodyString !== undefined) {
        req.end(bodyString);
      } else {
        req.end();
      }
    });
  }

  /**
   * HTTP/1.1 fallback used when the endpoint does not negotiate HTTP/2
   * (current cobra*-test hosts only accept http/1.1 via ALPN).
   */
  private http1Request(
    hostname: string,
    port: number,
    method: string,
    path: string,
    bodyString: string | undefined,
    timeout: number
  ): Promise<CobraHttpResponse> {
    return new Promise((resolve, reject) => {
      let settled = false;

      const fail = (err: Error) => {
        if (settled) {
          return;
        }
        settled = true;
        reject(err);
      };

      const req = https.request(
        {
          hostname,
          port,
          path,
          method,
          rejectUnauthorized: false,
          headers: this.buildRequestHeaders(bodyString),
          timeout,
        },
        res => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer | string) => {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          });
          res.on('end', () => {
            if (settled) {
              return;
            }
            settled = true;
            resolve({
              statusCode: res.statusCode || 0,
              headers: res.headers as Record<
                string,
                string | string[] | undefined
              >,
              rawBody: Buffer.concat(chunks).toString('utf8'),
              protocol: 'http1.1',
            });
          });
          res.on('error', fail);
        }
      );

      req.on('timeout', () => {
        const timeoutError = new Error(
          `Cobra API request timeout after ${timeout}ms`
        );
        req.destroy(timeoutError);
        fail(timeoutError);
      });

      req.on('error', fail);

      if (bodyString !== undefined) {
        req.end(bodyString);
      } else {
        req.end();
      }
    });
  }

  private parseResponseBody<T>(response: CobraHttpResponse): T {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      let errorMessage: string;
      try {
        const errorData: CobraErrorResponse = JSON.parse(response.rawBody);
        console.error(
          '[CobraClient.makeRequest] Error response (JSON):',
          errorData
        );
        errorMessage =
          errorData.message || `Cobra API error: ${response.statusCode}`;
      } catch (jsonError) {
        console.error(
          '[CobraClient.makeRequest] Error response (text):',
          response.rawBody
        );
        errorMessage =
          response.rawBody || `Cobra API error: ${response.statusCode}`;
      }
      throw new Error(errorMessage);
    }

    const contentType = getHeaderValue(response.headers, 'content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      if (!response.rawBody) {
        return {} as T;
      }
      const data = JSON.parse(response.rawBody);
      console.log('[CobraClient.makeRequest] Success, received JSON response');
      return data;
    }
    console.log('[CobraClient.makeRequest] Success, no JSON content');
    return {} as T;
  }

  /**
   * Prefers HTTP/2; falls back to HTTP/1.1 when h2 is not available.
   */
  private async makeRequest<T>(
    url: string,
    method: string,
    options: CobraRequestOptions
  ): Promise<T> {
    const { body, timeout = this.defaultTimeout } = options;
    const bodyString = body ? JSON.stringify(body) : undefined;

    try {
      console.log(`[CobraClient.makeRequest] ${method} ${url}`);
      console.log(
        '[CobraClient.makeRequest] Body:',
        bodyString ? bodyString : 'none'
      );

      const parsedUrl = new URL(url);
      const port = parseInt(parsedUrl.port || '443', 10);
      const authority = `https://${parsedUrl.hostname}:${port}`;
      const path = `${parsedUrl.pathname}${parsedUrl.search}`;

      let response: CobraHttpResponse;
      try {
        response = await this.http2Request(
          authority,
          method,
          path,
          bodyString,
          timeout
        );
      } catch (http2Error) {
        console.warn(
          '[CobraClient.makeRequest] HTTP/2 unavailable, falling back to HTTP/1.1:',
          (http2Error as Error).message || http2Error
        );
        response = await this.http1Request(
          parsedUrl.hostname,
          port,
          method,
          path,
          bodyString,
          timeout
        );
      }

      console.log(
        `[CobraClient.makeRequest] Response status: ${
          response.statusCode
        } (protocol=${response.protocol})`
      );

      return this.parseResponseBody<T>(response);
    } catch (error) {
      console.error('[CobraClient.makeRequest] Exception:', error);
      throw error;
    }
  }

  async viewUserInfo(args: { id_or_displayname: string }): Promise<any> {
    // Changed to POST request to follow REST best practices
    return this.post<any>('/api/sailpoint/viewuserinfo', {
      body: args,
    });
  }

  async createUniqueEmail(
    args: CreateUniqueEmailArgs
  ): Promise<CreateUniqueEmailResponse> {
    return this.post<CreateUniqueEmailResponse>('/api/createuniqueemail', {
      body: args,
    });
  }

  async getUserDetails(args: GetUserDetailsArgs): Promise<any> {
    return this.post<any>('/api/ping/getuserdetails', {
      body: args,
    });
  }

  async isUserRegistered(args: IsUserRegisteredArgs): Promise<any> {
    return this.post<any>('/api/ldap/users/isUserRegistered', {
      body: args,
    });
  }

  async otpAuthRequired(args: OtpAuthRequiredArgs): Promise<any> {
    return this.post<any>('/api/ldap/users/otpauthrequired', {
      body: args,
    });
  }

  async pwdReset(args: PwdResetArgs): Promise<any> {
    return this.post<any>('/api/ldap/users/pwdreset', {
      body: args,
    });
  }

  async lockAccount(args: LockAccountArgs): Promise<any> {
    return this.post<any>('/api/lockaccount', {
      body: args,
    });
  }
}
