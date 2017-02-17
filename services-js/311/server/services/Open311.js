// @flow

import fetch from 'isomorphic-fetch';
import url from 'url';
import { URLSearchParams } from 'urlsearchparams';
import HttpsProxyAgent from 'https-proxy-agent';
import DataLoader from 'dataloader';

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
  datatype: 'Text' | 'Informational' | 'Picklist' | 'Boolean (checkbox)',
  datatype_description: ?string,
  order: ?number,
  description: string,
  code: string,
  variable: boolean,
  values?: {|
    key: string,
    name: string,
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
    let message;

    if (res.headers.get('content-type').startsWith('application/json')) {
      const firstError = (await res.json())[0];
      message = firstError.message || firstError.description || 'Open311 server error';
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
  endpoint: string;
  apiKey: string;
  serviceDataLoader: DataLoader<string, ?Service>;

  constructor(endpoint: ?string, apiKey: ?string) {
    if (!endpoint || !apiKey) {
      throw new Error('Must specify an api key and and endpoint');
    }

    this.endpoint = endpoint;
    this.apiKey = apiKey;

    if (process.env.http_proxy) {
      this.agent = new HttpsProxyAgent(process.env.http_proxy);
    }

    // There's no API for just loading the name / code info for a single
    // service, so if we need that information we load all of the services
    // and then filter. We use DataLoader here to coallesce any simultaneous
    // requests for service lookup to a single API call.
    this.serviceDataLoader = new DataLoader(async (codes: string[]) => {
      const servicesByCode = {};
      (await this.services()).forEach((s) => { servicesByCode[s.service_code] = s; });
      return codes.map((code) => servicesByCode[code] || null);
    });
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

  async service(code: string): Promise<?Service> {
    return this.serviceDataLoader.load(code);
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
