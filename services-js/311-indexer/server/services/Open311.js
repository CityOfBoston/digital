// @flow

import fetch from 'node-fetch';
import URLSearchParams from 'url-search-params';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent';

type Case = {|
  service_request_id: string,
  status: string,
  status_notes: ?string,
  service_name: ?string,
  service_code: string,
  description: ?string,
  agency_responsible: ?string,
  service_notice: ?string,
  // 2017-02-21T22:18:27.000Z
  requested_datetime: string,
  updated_datetime: string,
  expected_datetime: ?string,
  address: ?string,
  address_id: ?string,
  zipcode: ?string,
  lat: ?number,
  long: ?number,
  media_url: ?string,
|};

async function processResponse(res): Promise<any> {
  if (res.status === 404) {
    return null;
  } else if (!res.ok) {
    let message;

    if (
      (res.headers.get('content-type') || '').startsWith('application/json')
    ) {
      const firstError = (await res.json())[0];
      message =
        firstError.message || firstError.description || 'Open311 server error';
    } else {
      message = await res.text();
    }

    throw new Error(message);
  }

  return res.json();
}

/**
 * Service wrapper around our Open311 endpoint. Expected to be created fresh
 * for each request.
 *
 * Supports an HTTP proxy set via the $http_proxy env variable.
 *
 * Documentation: https://bos311.api-docs.io/
 */
export default class Open311 {
  agent: any;
  opbeat: any;
  endpoint: string;
  apiKey: ?string;

  constructor(endpoint: ?string, apiKey: ?string, opbeat: any) {
    if (!endpoint) {
      throw new Error('Must specify an Open311 endpoint');
    }

    this.endpoint = endpoint;
    this.apiKey = apiKey;

    this.opbeat = opbeat;

    if (process.env.http_proxy) {
      this.agent = new HttpsProxyAgent(process.env.http_proxy);
    }
  }

  url(path: string) {
    return url.resolve(this.endpoint, path);
  }

  async loadCases(ids: Array<string>): Promise<Array<Case>> {
    const transaction = this.opbeat.startTransaction('request', 'Open311');

    const params = new URLSearchParams();
    params.append('service_request_id', ids.join(','));

    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

    const response = await fetch(
      this.url(`requests.json?${params.toString()}`),
      {
        agent: this.agent,
      }
    );

    // the endpoint returns the request in an array
    const requestArr: Case[] = await processResponse(response);

    if (transaction) {
      transaction.end();
    }

    return requestArr;
  }
}
