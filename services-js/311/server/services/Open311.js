// @flow

import 'isomorphic-fetch';
import URLSearchParams from 'url-search-params';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent';
import DataLoader from 'dataloader';

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
    location_required?: boolean,
    contact_required?: boolean,
    location?: {|
      required: boolean,
      visible: boolean,
    |},
    reporter?: {|
      required: boolean,
      visible: boolean,
    |},
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
  expected_datetime: ?string,
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
  description: string,
  media_url: ?string,
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
  opbeat: any;
  endpoint: string;
  apiKey: ?string;
  serviceLoader: DataLoader<string, ?Service>;
  serviceMetadataLoader: DataLoader<string, ?ServiceMetadata>;
  requestLoader: DataLoader<string, ?ServiceRequest>;

  constructor(endpoint: ?string, apiKey: ?string, opbeat: any) {
    if (!endpoint) {
      throw new Error('Must specify an endpoint');
    }

    this.endpoint = endpoint;
    this.apiKey = apiKey;

    this.opbeat = opbeat;

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

    this.serviceMetadataLoader = new DataLoader(async (codes: string[]) => {
      const transaction = opbeat && opbeat.startTransaction('serviceMetadata', 'Open311');
      const out = await Promise.all(codes.map(async (code) => {
        const params = new URLSearchParams();
        if (this.apiKey) {
          params.append('api_key', this.apiKey);
        }

        let additionalPath = '';
        if (process.env['311_METADATA_PATH']) {
          additionalPath = `${process.env['311_METADATA_PATH']}/`;
        }

        try {
          const response = await fetch(this.url(`services/${additionalPath}${code}.json?${params.toString()}`), {
            agent: this.agent,
          });

          return await processResponse(response);
        } catch (e) {
          throw new Error(`Error loading metadata for ${code}: ${e.toString()}`);
        }
      }));

      if (transaction) {
        transaction.end();
      }
      return out;
    });

    this.requestLoader = new DataLoader(async (ids: string[]) => {
      const transaction = opbeat && opbeat.startTransaction('request', 'Open311');
      const out = await Promise.all(ids.map(async (id) => {
        const params = new URLSearchParams();
        if (this.apiKey) {
          params.append('api_key', this.apiKey);
        }

        const response = await fetch(this.url(`requests/${id}.json?${params.toString()}`), {
          agent: this.agent,
        });

        // the endpoint returns the request in an array
        const requestArr: ?ServiceRequest[] = await processResponse(response);
        return requestArr ? requestArr[0] : null;
      }));

      if (transaction) {
        transaction.end();
      }
      return out;
    });
  }

  url(path: string) {
    return url.resolve(this.endpoint, path);
  }

  services = async (): Promise<Service[]> => {
    const transaction = this.opbeat && this.opbeat.startTransaction('services', 'Open311');
    const params = new URLSearchParams();
    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

    const response = await fetch(this.url(`services.json?${params.toString()}`), {
      agent: this.agent,
    });

    const out = await processResponse(response) || [];
    if (transaction) {
      transaction.end();
    }
    return out;
  };

  service(code: string): Promise<?Service> {
    return this.serviceLoader.load(code);
  }

  serviceMetadata(code: string): Promise<?ServiceMetadata> {
    return this.serviceMetadataLoader.load(code);
  }

  request(id: string): Promise<?ServiceRequest> {
    return this.requestLoader.load(id);
  }

  requests = async () => {
    const transaction = this.opbeat && this.opbeat.startTransaction('requests', 'Open311');
    const params = new URLSearchParams();
    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

    const response = await fetch(this.url(`requests.json?${params.toString()}`), {
      agent: this.agent,
    });

    const out = await processResponse(response) || [];
    if (transaction) {
      transaction.end();
    }
    return out;
  };


  async createRequest(args: CreateServiceRequestArgs): Promise<ServiceRequest> {
    const params = new URLSearchParams();
    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

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
