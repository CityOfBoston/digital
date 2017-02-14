// @flow

import fetch from 'isomorphic-fetch';
import url from 'url';
import { URLSearchParams } from 'urlsearchparams';
import HttpsProxyAgent from 'https-proxy-agent';

// types taken from Open311
export type Service = {|
  service_code: string,
  service_name: string,
  description: string,
  metadata: boolean,
  type: 'realtime' | 'batch' | 'blackbox',
  keywords: string,
  group: string,
|}

export type ServiceMetadataAttribute = {|
  required: boolean,
  datatype: 'Text' | 'Informational' | 'Picklist',
  datatype_description: ?string,
  order: ?number,
  description: string,
  code: string,
  variable: boolean,
  values?: {|
    key: string,
    value: string,
  |}[],
|};

export type ServiceMetadata = {|
  service_code: string,
  attributes: ServiceMetadataAttribute[],
|}

export type NewRequestParams = {|
  service_code: string,
  lat?: number,
  long?: number,
  address_string?: string,
  address_id?: string,
  attribute?: string[],
  requestor_first_name: ?string,
  requestor_last_name: ?string,
  requestor_email: ?string,
  requestor_phone: ?string,
  service_description: string,
|};

async function processResponse(res): Promise<any> {
  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

/**
 * Service wrapper around our Open311 endpoint.
 *
 * Supports an HTTP proxy set via the $http_proxy env variable.
 *
 * Documentation: https://bos311.api-docs.io/
 */
export default class Open311 {
  agent: any;
  endpoint: string;
  apiKey: string;

  constructor(endpoint: ?string, apiKey: ?string) {
    if (!endpoint || !apiKey) {
      throw new Error('Must specify an api key and and endpoint');
    }

    this.endpoint = endpoint;
    this.apiKey = apiKey;

    if (process.env.http_proxy) {
      this.agent = new HttpsProxyAgent(process.env.http_proxy);
    }
  }

  url(path: string) {
    return url.resolve(this.endpoint, path);
  }

  async services(): Promise<Service[]> {
    const params = new URLSearchParams();
    params.append('api_key', this.apiKey);

    const response = await fetch(this.url(`services.json?${params.toString()}`), {
      agent: this.agent,
    });

    return processResponse(response);
  }

  async serviceMetadata(code: string): Promise<ServiceMetadata> {
    const params = new URLSearchParams();
    params.append('api_key', this.apiKey);

    const response = await fetch(this.url(`services/${code}.json?${params.toString()}`), {
      agent: this.agent,
    });

    return processResponse(response);
  }

  async createRequest(args: NewRequestParams) {
    const params = new URLSearchParams();
    params.append('api_key', this.apiKey);

    Object.keys(args).forEach((key) => {
      switch (key) {
        case 'lat':
        case 'long':
          if (args[key] !== undefined) {
            params.append(key, args[key].toString());
          }
          break;
        case 'attribute':
          // TODO(finh): figure this out
          break;
        default:
          params.append(key, args[key] || '');
      }
    });

    const body = params.toString();
    const bodyBuf = Buffer.from(body, 'utf-8');

    const response = await fetch(this.url('requests.json'), {
      agent: this.agent,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        'Content-Length': `${bodyBuf.length}`,
      },
      method: 'POST',
      body,
    });

    return processResponse(response);
  }
}
