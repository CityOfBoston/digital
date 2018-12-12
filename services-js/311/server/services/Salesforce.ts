import fetch, { RequestInit, Headers, Response } from 'node-fetch';
import FormData from 'form-data';

const AUTH_RETRIES = 2;

/**
 * Helper because we need to send Salesforce authentication information when
 * calling the Open311 API.
 *
 * We don’t have a fake implementation of this because we just don’t do any auth
 * in test / dev modes.
 */
export class Salesforce {
  private readonly oauthUrl: string;
  private readonly consumerKey: string;
  private readonly consumerSecret: string;
  private readonly username: string;
  private readonly password: string;
  private readonly securityToken: string;

  // Used to keep track of whether there is an in-flight request to get the auth
  // token. If so, we can wait on the promise.
  private authenticating: boolean;

  // We have a Promise for the token, so that if we're in the process of
  // re-authorizing, many fetch requests can all await the same response.
  private tokenPromise: Promise<string> | null = null;

  constructor(
    oauthUrl: string | undefined,
    consumerKey: string | undefined,
    consumerSecret: string | undefined,
    username: string | undefined,
    password: string | undefined,
    securityToken: string | undefined
  ) {
    if (!oauthUrl) {
      throw new Error('Missing Salesforce oauth URL');
    }

    if (!consumerKey) {
      throw new Error('Missing Salesforce consumer key');
    }

    if (!consumerSecret) {
      throw new Error('Missing Salesforce consumer secret');
    }

    if (!username) {
      throw new Error('Missing Salesforce username');
    }

    if (!password) {
      throw new Error('Missing Salesforce password');
    }

    if (!securityToken) {
      throw new Error('Missing Salesforce security token');
    }

    this.oauthUrl = oauthUrl;
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
    this.username = username;
    this.password = password;
    this.securityToken = securityToken;

    this.authenticating = false;
  }

  /**
   * Reloads the authorization token. De-dupes simultaneous requests to return
   * the same promise.
   */
  public async reauthorize(): Promise<void> {
    if (this.authenticating) {
      await this.tokenPromise;
    } else {
      try {
        this.authenticating = true;
        // we save this out before awaiting so that other calls to reauthorize
        // can await on it without re-calling fetchAuthorizationToken.
        this.tokenPromise = this.fetchAuthorizationToken();

        await this.tokenPromise;
      } finally {
        this.authenticating = false;
      }
    }
  }

  private async fetchAuthorizationToken(): Promise<string> {
    const body = new FormData();
    body.append('grant_type', 'password');
    body.append('client_id', this.consumerKey);
    body.append('client_secret', this.consumerSecret);
    body.append('username', this.username);
    body.append('password', `${this.password}${this.securityToken || ''}`);

    const res = await fetch(this.oauthUrl, { method: 'POST', body });
    const json = await res.json();

    if (!res.ok) {
      const err = new Error(
        json.error_description || 'Error authenticating to Salesforce'
      );

      (err as any).extra = { responseJson: json };

      throw err;
    } else {
      return json.access_token;
    }
  }

  private async internalFetch(
    url: string,
    opts: RequestInit = {}
  ): Promise<Response> {
    // this is just a typechecking thing
    if (Array.isArray(opts.headers)) {
      throw new Error('Illegal header format');
    }

    const headers = new Headers(opts.headers || {});
    headers.append('Authorization', `Bearer ${await this.tokenPromise}`);

    return fetch(url, {
      ...opts,
      headers,
    });
  }

  // This is complicated because we don't know that our OAuth token has expired
  // until a request fails. When that happens, we try to reauthorize and then
  // try again.
  public async authenticatedFetch(
    url: string,
    opts: RequestInit = {}
  ): Promise<Response> {
    let resp: Response | null = null;

    for (let i = 0; i <= AUTH_RETRIES; ++i) {
      resp = await this.internalFetch(url, opts);
      if (resp.status === 401) {
        // Calling this will set up a new tokenPromise, which the next time
        // through internalFetch will wait on.
        this.reauthorize();
      } else {
        return resp;
      }
    }

    const err = new Error(
      `Fetch failed after trying reauthorization ${AUTH_RETRIES} times`
    );

    (err as any).extra = { responseText: resp ? await resp.text() : '' };

    throw err;
  }
}
