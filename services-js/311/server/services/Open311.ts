import fetch from 'node-fetch';
import URLSearchParams from 'url-search-params';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent';
import DataLoader from 'dataloader';
import { Salesforce } from './Salesforce';

// types taken from Open311
export interface Service {
  service_code: string;
  service_name: string | undefined;
  description: string;
  metadata: boolean;
  type: 'realtime' | 'batch' | 'blackbox';
  keywords: string | undefined;
  group: string;
}

export interface PlainValue {
  key: string;
  name: string;
  img?: string;
}

export interface DependentCondition {
  attribute: string;
  op: 'eq' | 'neq' | 'in' | 'gt' | 'gte' | 'lt' | 'lte';

  value: number | string | string[];
}

export interface DependentConditions {
  clause: 'OR' | 'AND';
  conditions: DependentCondition[];
}

export interface ConditionalValues {
  dependentOn: DependentConditions;
  values: PlainValue[];
}

export interface Validation {
  dependentOn: DependentConditions;
  message?: string;
  reportOnly?: boolean;
}

export type ServiceMetadataAttributeValue = PlainValue | ConditionalValues;

export function isPlainValue(
  s: ServiceMetadataAttributeValue
): s is PlainValue {
  return (s as any).hasOwnProperty('key');
}

export function isConditionalValues(
  s: ServiceMetadataAttributeValue
): s is ConditionalValues {
  return (s as any).hasOwnProperty('values');
}

export interface ServiceMetadataAttribute {
  required: boolean;
  datatype: 'Text' | 'Informational' | 'Picklist' | 'Boolean (checkbox)';
  datatype_description: string | undefined;
  order: number | undefined;
  description: string;
  code: string;
  variable: boolean;

  values?: ServiceMetadataAttributeValue[] | number;
  dependencies?: DependentConditions;
  validations?: Validation[];
}

export interface ServiceMetadata {
  service_code: string;
  attributes: ServiceMetadataAttribute[];
  definitions:
    | {
        location_required?: boolean;
        contact_required?: boolean;
        location?: {
          required: boolean;
          visible: boolean;
        };

        reporter?: {
          required: boolean;
          visible: boolean;
        };
      }
    | undefined;
}

// Returned by the bulk endpoint and posting the submission.
export interface ServiceRequest {
  service_request_id: string;
  status: string;
  status_notes: string | undefined;
  service_name: string | undefined;
  service_code: string;
  description: string | undefined;
  agency_responsible: string | undefined;
  service_notice: string | undefined;

  requested_datetime: string | undefined;
  updated_datetime: string | undefined;
  expected_datetime: string | undefined;
  address: string | undefined;
  address_id: string | undefined;
  zipcode: string | undefined;
  lat: number | undefined;
  long: number | undefined;
  media_url: string | undefined;
}

// Returned by the single-request endpoint and posting the submission.
export interface DetailedServiceRequest {
  id: string;
  service_request_id: string;
  status: string;
  long: number | undefined;
  lat: number | undefined;

  media_url:
    | Array<{
        id: string;
        url: string;
        tags: string[];
      }>
    | string
    | undefined;

  service_name: string | undefined;
  service_code: string;
  description: string | undefined;

  requested_datetime: string | undefined;
  expected_datetime: string | undefined;
  updated_datetime: string | undefined;
  address: string | undefined;
  address_details: string | undefined;
  zipcode: string | undefined;
  reported_location:
    | {
        address: string | undefined;
        address_id: string | undefined;
        lat: number | undefined;
        long: number | undefined;
      }
    | undefined;

  address_id: string | undefined;
  agency_responsible: string | undefined;
  service_notice: string | undefined;
  status_notes: string | undefined;
  duplicate_parent_service_request_id: string | undefined;
  parent_service_request_id: string | undefined;
  origin: string | undefined;
  source: string | undefined;
  priority: string;
  service_level_agreement: any;
  owner: any;
  contact: {
    first_name: string | undefined;
    last_name: string | undefined;
    phone: string | undefined;
    email: string | undefined;
  };

  closure_details: {
    reason: string | undefined;
    comment: string | undefined;
  };

  activities: ServiceRequestActivity[];
  attributes: any[];
  events: any[];
}

export interface ServiceRequestActivity {
  code: string;
  order: number;
  description: string | undefined;
  status: 'Complete' | 'Void';

  completion_date: string | undefined;
  media_url?: Array<{
    id: string;
    url: string;
    tags: string[];
  }>;
}

export interface CreateServiceRequestArgs {
  service_code: string;
  lat?: number;
  long?: number;
  address_string?: string;
  address_id?: string;
  first_name: string | undefined;
  last_name: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  description: string;
  media_url: string | undefined;
  attributes: { code: string; value: string }[];
}

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
export class Open311 {
  private readonly agent: any;
  private readonly opbeat: any;
  private readonly salesforce: Salesforce | null;
  private readonly endpoint: string;
  private readonly apiKey: string | undefined;

  private readonly serviceLoader: DataLoader<string, Service | undefined>;
  private readonly serviceMetadataLoader: DataLoader<
    string,
    ServiceMetadata | undefined
  >;
  private readonly requestLoader: DataLoader<
    string,
    ServiceRequest | DetailedServiceRequest | null
  >;

  constructor(
    endpoint: string | undefined,
    apiKey: string | undefined,
    salesforce: Salesforce | null,
    opbeat: any
  ) {
    if (!endpoint) {
      throw new Error('Must specify an Open311 endpoint');
    }

    this.endpoint = endpoint;
    this.apiKey = apiKey;

    this.salesforce = salesforce;
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
      (await this.services()).forEach(s => {
        servicesByCode[s.service_code] = s;
      });
      return codes.map(code => servicesByCode[code] || null);
    });

    this.serviceMetadataLoader = new DataLoader(async (codes: string[]) => {
      const transaction =
        opbeat && opbeat.startTransaction('serviceMetadata', 'Open311');
      const out = await Promise.all(
        codes.map(async code => {
          const params = new URLSearchParams();
          if (this.apiKey) {
            params.append('api_key', this.apiKey);
          }

          let additionalPath = '';
          if (process.env.PROD_311_METADATA_PATH) {
            additionalPath = `${process.env.PROD_311_METADATA_PATH}/`;
          }

          try {
            const response = await this.fetch(
              this.url(
                `services/${additionalPath}${code}.json?${params.toString()}`
              ),

              {
                agent: this.agent,
              }
            );

            return await processResponse(response);
          } catch (e) {
            throw new Error(
              `Error loading metadata for ${code}: ${e.toString()}`
            );
          }
        })
      );

      if (transaction) {
        transaction.end();
      }
      return out;
    });

    this.requestLoader = new DataLoader(async (ids): Promise<
      Array<ServiceRequest | DetailedServiceRequest | null>
    > => {
      let transaction;

      const params = new URLSearchParams();
      if (this.apiKey) {
        params.append('api_key', this.apiKey);
      }

      try {
        if (ids.length === 1) {
          // The <case_id>.json endpoint is currently significantly faster than
          // the bulk endpoint, even for a single case, so we optimize by using
          // it when there's only one thing to look up.
          transaction = opbeat && opbeat.startTransaction('request', 'Open311');
          const response = await this.fetch(
            this.url(`request/${ids[0]}.json?${params.toString()}`),
            {
              agent: this.agent,
            }
          );

          // For whatever reason, looking up a single request ID still returns
          // an array.
          const requestArr: Array<
            DetailedServiceRequest | undefined
          > = await processResponse(response);

          // processResponse turns 404s into nulls
          if (requestArr) {
            return [requestArr[0] || null];
          } else {
            return [null];
          }
        } else {
          transaction =
            opbeat && opbeat.startTransaction('bulk-request', 'Open311');

          params.append('service_request_id', ids.join(','));

          const response = await this.fetch(
            this.url(`requests.json?${params.toString()}`),
            {
              agent: this.agent,
            }
          );

          const requestArr: ServiceRequest[] = await processResponse(response);

          // We need to guarantee that we're returning an array with results in
          // the same order as the IDs that came in, which we don't want to rely
          // on Open311 to ensure.
          const requestMap: { [id: string]: ServiceRequest } = {};
          requestArr.forEach(r => {
            requestMap[r.service_request_id] = r;
          });

          return ids.map(id => requestMap[id]);
        }
      } finally {
        if (transaction) {
          transaction.end();
        }
      }
    });
  }

  public fetch(url: string, opts?: any) {
    if (this.salesforce) {
      return this.salesforce.authenticatedFetch(url, opts);
    } else {
      return fetch(url, opts);
    }
  }

  public url(path: string) {
    return url.resolve(this.endpoint, path);
  }
  public readonly services = async (): Promise<Service[]> => {
    const transaction =
      this.opbeat && this.opbeat.startTransaction('services', 'Open311');
    const params = new URLSearchParams();
    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

    const response = await this.fetch(
      this.url(`services.json?${params.toString()}`),
      {
        agent: this.agent,
      }
    );

    const out = (await processResponse(response)) || [];
    if (transaction) {
      transaction.end();
    }
    return out;
  };

  public service(code: string): Promise<Service | undefined> {
    return this.serviceLoader.load(code);
  }

  public serviceMetadata(code: string): Promise<ServiceMetadata | undefined> {
    return this.serviceMetadataLoader.load(code);
  }

  public request(
    id: string
  ): Promise<ServiceRequest | DetailedServiceRequest | null> {
    return this.requestLoader.load(id);
  }
  public readonly requests = async () => {
    const transaction =
      this.opbeat && this.opbeat.startTransaction('requests', 'Open311');
    const params = new URLSearchParams();
    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

    const response = await this.fetch(
      this.url(`requests.json?${params.toString()}`),
      {
        agent: this.agent,
      }
    );

    const out = (await processResponse(response)) || [];
    if (transaction) {
      transaction.end();
    }
    return out;
  };

  public async createRequest(
    args: CreateServiceRequestArgs
  ): Promise<DetailedServiceRequest> {
    const params = new URLSearchParams();
    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

    Object.keys(args).forEach(key => {
      switch (key) {
        case 'lat':
        case 'long': {
          const v = args[key];
          if (typeof v !== 'undefined') {
            params.append(key, v.toString());
          }
          break;
        }

        case 'attributes':
          args[key].map(({ code, value }) =>
            params.append(`attribute[${code}]`, value)
          );

          break;
        default:
          if (args[key]) {
            params.append(key, args[key]);
          }
      }
    });

    const body = params.toString();
    const bodyBuf = Buffer.from(body, 'utf-8');

    const response = await this.fetch(this.url('requests.json'), {
      agent: this.agent,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Content-Length': `${bodyBuf.length}`,
      },

      method: 'POST',
      body,
    });

    return (await processResponse(response))[0];
  }
}
