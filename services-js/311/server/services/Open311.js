// @flow

import 'isomorphic-fetch';
import URLSearchParams from 'url-search-params';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent';
import DataLoader from 'dataloader';

import { measure } from './metrics';

// types taken from Open311
export type Service = {|
  service_code: string,
  service_name: ?string,
  description: string,
  metadata: boolean,
  type: 'realtime' | 'batch' | 'blackbox',
  keywords: string,
  group: string,
|}

export type PlainValue = {|
  key: string,
  name: string,
  img?: string,
|};

export type DependentCondition = {|
  attribute: string,
  op: 'eq' | 'neq' | 'in' | 'gt' | 'gte' | 'lt' | 'lte',
  // This is polymorphic; when comparing with a multipicklist this can 'eq'
  // an array of strings.
  value: number | string | string[],
|};

export type DependentConditions = {|
    clause: 'OR' | 'AND',
    conditions: DependentCondition[],
|};

export type ConditionalValues = {|
  dependentOn: DependentConditions,
  values: PlainValue[],
|};

export type ServiceMetadataAttributeValue = PlainValue | ConditionalValues;

export type ServiceMetadataAttribute = {|
  required: boolean,
  datatype: 'Text' | 'Informational' | 'Picklist' | 'Boolean (checkbox)',
  datatype_description: ?string,
  order: ?number,
  description: string,
  code: string,
  variable: boolean,
  values?: ServiceMetadataAttributeValue[],
  dependencies?: DependentConditions,
|};

export type ServiceMetadata = {|
  service_code: string,
  attributes: ServiceMetadataAttribute[],
  definitions: ?{|
    location_required: boolean,
    contact_required: boolean,
  |}
|}

export type ServiceRequest = {|
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
  expected_datetime: string,
  address: ?string,
  address_id: ?string,
  zipcode: ?string,
  lat: ?number,
  long: ?number,
  media_url: ?string,
|};

export type CreateServiceRequestArgs = {|
  service_code: string,
  lat?: number,
  long?: number,
  address_string?: string,
  address_id?: string,
  first_name: ?string,
  last_name: ?string,
  email: ?string,
  phone: ?string,
  service_description: string,
  attributes: {code: string, value: string}[],
|};

async function processResponse(res): Promise<any> {
  if (res.status === 404) {
    return null;
  } else if (!res.ok) {
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
  serviceLoader: DataLoader<string, ?Service>;
  serviceMetadataLoader: DataLoader<string, ?ServiceMetadata>;
  requestLoader: DataLoader<string, ?ServiceRequest>;

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
    this.serviceLoader = new DataLoader(async (codes: string[]) => {
      const servicesByCode = {};
      (await this.services()).forEach((s) => { servicesByCode[s.service_code] = s; });
      return codes.map((code) => servicesByCode[code] || null);
    });

    this.serviceMetadataLoader = new DataLoader((codes: string[]) => (
      Promise.all(codes.map(measure('service', 'Open311', async (code) => {
        const params = new URLSearchParams();
        params.append('api_key', this.apiKey);

        const response = await fetch(this.url(`services/${code}.json?${params.toString()}`), {
          agent: this.agent,
        });

        return processResponse(response);
      })),
    )));

    this.requestLoader = new DataLoader((ids: string[]) => (
      Promise.all(ids.map(measure('request', 'Open311', async (id) => {
        const params = new URLSearchParams();
        params.append('api_key', this.apiKey);

        const response = await fetch(this.url(`requests/${id}.json?${params.toString()}`), {
          agent: this.agent,
        });

        // the endpoint returns the request in an array
        const requestArr: ?ServiceRequest[] = await processResponse(response);
        return requestArr ? requestArr[0] : null;
      })),
    )));
  }

  url(path: string) {
    return url.resolve(this.endpoint, path);
  }

  services = measure('services', 'Open311', async (): Promise<Service[]> => {
    const params = new URLSearchParams();
    params.append('api_key', this.apiKey);

    const response = await fetch(this.url(`services.json?${params.toString()}`), {
      agent: this.agent,
    });

    return await processResponse(response) || [];
  })

  service(code: string): Promise<?Service> {
    return this.serviceLoader.load(code);
  }

  serviceMetadata(code: string): Promise<?ServiceMetadata> {
    return this.serviceMetadataLoader.load(code);
  }

  request(id: string): Promise<?ServiceRequest> {
    return this.requestLoader.load(id);
  }

  async createRequest(args: CreateServiceRequestArgs): Promise<ServiceRequest> {
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
        case 'attributes':
          args[key].map(({ code, value }) => params.append(`attribute[${code}]`, value));
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
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Content-Length': `${bodyBuf.length}`,
      },
      method: 'POST',
      body,
    });

    return processResponse(response);
  }
}
