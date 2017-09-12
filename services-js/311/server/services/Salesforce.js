// @flow

import 'isomorphic-fetch';
import FormData from 'form-data';

const AUTH_RETRIES = 2;

// Wrapper to handle OAuth authentication
export default class Salesforce {
  opbeat: any;
  oauthUrl: string;
  consumerKey: string;
  consumerSecret: string;

  username: string;
  password: string;
  securityToken: string;

  // Used to keep track of whether there is an in-flight request to get the auth
  // token. If so, we can wait on the promise.
  authenticating: boolean;

  // We have a Promise for the token, so that if we're in the process of
  // re-authorizing, many fetch requests can all await the same response.
  tokenPromise: Promise<string>;

  constructor(
    oauthUrl: ?string,
    consumerKey: ?string,
    consumerSecret: ?string,
    username: ?string,
    password: ?string,
    securityToken: ?string,
    opbeat: any
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

    this.opbeat = opbeat;
    this.oauthUrl = oauthUrl;
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
    this.username = username;
    this.password = password;

    this.authenticating = false;
  }

  reauthorize(): Promise<mixed> {
    if (this.authenticating) {
      return this.tokenPromise;
    }

    this.authenticating = true;
    this.tokenPromise = this.fetchAuthorizationToken();
    this.tokenPromise.then(() => {
      this.authenticating = false;
    });

    return this.reauthorize();
  }

  async fetchAuthorizationToken(): Promise<string> {
    const body = new FormData();
    body.append('grant_type', 'password');
    body.append('client_id', this.consumerKey);
    body.append('client_secret', this.consumerSecret);
    body.append('username', this.username);
    body.append('password', `${this.password}${this.securityToken || ''}`);

    const res = await fetch(this.oauthUrl, { method: 'POST', body });
    const json = await res.json();

    if (!res.ok) {
      const err: any = new Error(
        json.error_description || 'Error authenticating to Salesforce'
      );
      err.extra = { responseText: await res.text() };
      throw err;
    } else {
      return json.access_token;
    }
  }

  async internalFetch(url: string, opts?: Object = {}): Promise<Response> {
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
  async authenticatedFetch(url: string, opts?: Object = {}): Promise<Response> {
    let resp = null;

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

    const err: any = new Error(
      `Fetch failed after trying reauthorization ${AUTH_RETRIES} times`
    );
    err.extra = { responseText: resp ? await resp.text() : '' };
    throw err;
  }
}
