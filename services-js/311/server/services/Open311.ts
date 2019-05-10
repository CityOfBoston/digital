import fetch, { Response, RequestInit } from 'node-fetch';
import URLSearchParams from 'url-search-params';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent';
import DataLoader from 'dataloader';
import { Salesforce } from './Salesforce';

// types taken from Open311
export interface Service {
  service_code: string;
  service_name: string | null;
  description: string;
  metadata: boolean;
  type: 'realtime' | 'batch' | 'blackbox';
  keywords: string | null;
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

  datatype:
    | 'text'
    | 'informational'
    | 'singlevaluelist'
    | 'boolean (checkbox)'
    | 'string'
    | 'number'
    | 'datetime'
    | 'date'
    | 'multivaluelist';
  datatype_description: string | null;
  order: number | null;
  description: string;
  code: string;
  variable: boolean;

  values?: ServiceMetadataAttributeValue[] | number;
  dependencies?: DependentConditions;
  validations?: Validation[];
}

export interface ServiceMetadata {
  service_code: string;
  service_name: string;
  description: string;

  attributes: ServiceMetadataAttribute[];
  activities: [];

  definitions?: {
    location_required?: boolean;
    contact_required?: boolean;
    location?: {
      required: boolean;
      visible: boolean;
    };

    service_categories: Array<{
      code: string;
      name: string;
      description: string;
    }>;

    reporter?: {
      required: boolean;
      visible: boolean;
      required_fields: null;
    };

    service_departments?: Object[];

    icons?: {
      service_icon: null;
      map_marker: null;
    };

    recommendations?: null;

    validations?: {
      geographical: null;
      messages: null;
      alerts: null;
    };
  };

  service_level_agreement?: {
    type: string | null;
    value: number | null;
  };
}

/**
 * This matches the return value of the single request endpoint and the result
 * of submitting a case. The bulk endpoint (not used in the web portal) has a
 * reduced number of fields.
 */
export interface DetailedServiceRequest {
  /** Internal Salesforce ID */
  id: string;

  /** Externally-shown ID, e.g. "19-00019877" */
  service_request_id: string;

  status: string;
  description: string | null;

  media_url:
    | Array<{
        id: string;
        url: string;
        tags: string[];
      }>
    | string
    | null;

  service_name: string | null;
  service_code: string;

  requested_datetime: string | null;
  expected_datetime: string | null;
  updated_datetime: string | null;

  long: number | null;
  lat: number | null;

  address: string | null;
  address_id: string | null;
  address_details: string | null;
  zipcode: string | null;

  reported_location: {
    address: string | null;
    address_id: string | null;
    lat: number | null;
    long: number | null;
  } | null;

  service_notice: string | null;
  status_notes: string | null;

  duplicate_parent_service_request_id: string | null;
  parent_service_request_id: string | null;

  origin: string | null;
  source: string | null;
  priority: string;

  agency_responsible: string | null;
  service_level_agreement: unknown;
  owner: unknown;

  contact: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    email: string | null;
  };

  closure_details: {
    reason: string | null;
    comment: string | null;
  };

  activities: ServiceRequestActivity[];
  attributes: unknown[];

  /** events does not currently appear when creating a request */
  events?: unknown[];
}

export interface ServiceRequestActivity {
  code: string;
  order: number;
  description: string | null;
  status: 'Not Started' | 'Complete' | 'Void';

  completion_date: string | null;
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

async function processResponse<T>(res: Response): Promise<T | null> {
  if (res.status === 404) {
    return null;
  } else if (!res.ok) {
    let message: string;

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
  private readonly agent: any;
  private readonly salesforce: Salesforce | null;
  private readonly endpoint: string;
  private readonly apiKey: string | undefined;

  private readonly serviceLoader: DataLoader<string, Service | null>;
  private readonly serviceMetadataLoader: DataLoader<
    string,
    ServiceMetadata | null
  >;
  private readonly requestLoader: DataLoader<
    string,
    DetailedServiceRequest | null
  >;

  constructor(
    endpoint: string | undefined,
    apiKey: string | undefined,
    salesforce: Salesforce | null
  ) {
    if (!endpoint) {
      throw new Error('Must specify an Open311 endpoint');
    }

    this.endpoint = endpoint;
    this.apiKey = apiKey;

    this.salesforce = salesforce;

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
      const out = await Promise.all(
        codes.map(async code => {
          const params = new URLSearchParams();
          if (this.apiKey) {
            params.append('api_key', this.apiKey);
          }

          let additionalPath = '';
          if (process.env.OPEN311_METADATA_PATH) {
            additionalPath = `${process.env.OPEN311_METADATA_PATH}/`;
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

            return await processResponse<ServiceMetadata>(response);
          } catch (e) {
            return new Error(
              `Error loading metadata for ${code}: ${e.toString()}`
            );
          }
        })
      );

      return out;
    });

    this.requestLoader = new DataLoader(
      async (ids): Promise<Array<DetailedServiceRequest | null>> => {
        const params = new URLSearchParams();
        if (this.apiKey) {
          params.append('api_key', this.apiKey);
        }

        return Promise.all(
          ids.map(async id => {
            // We don't bother with the bulk endpoint in the webapp because the
            // only time we show more than one case is when we show search
            // results, and that data comes 100% from the Elasticsearch index.
            //
            // We still use a DataLoader, however, on the off chance that the same
            // request will cause a double-lookup to a case.
            const response = await this.fetch(
              this.url(`request/${id}.json?${params.toString()}`),
              {
                agent: this.agent,
              }
            );

            // For whatever reason, looking up a single request ID still returns
            // an array.
            const requestArr = await processResponse<DetailedServiceRequest[]>(
              response
            );

            return (requestArr && requestArr[0]) || null;
          })
        );
      }
    );
  }

  private fetch(url: string, opts?: RequestInit) {
    if (this.salesforce) {
      return this.salesforce.authenticatedFetch(url, opts);
    } else {
      return fetch(url, opts);
    }
  }

  private url(path: string) {
    return url.resolve(this.endpoint, path);
  }

  public readonly services = async (): Promise<Service[]> => {
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

    return (await processResponse(response)) || [];
  };

  public service(code: string): Promise<Service | null> {
    return this.serviceLoader.load(code);
  }

  public serviceMetadata(code: string): Promise<ServiceMetadata | null> {
    return this.serviceMetadataLoader.load(code);
  }

  public request(id: string): Promise<DetailedServiceRequest | null> {
    return this.requestLoader.load(id);
  }

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

        case 'phone':
          {
            const phone = args.phone;
            if (phone) {
              params.append('phone', normalizePhoneNumber(phone));
            }
          }

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

    return (await processResponse<DetailedServiceRequest[]>(response))![0];
  }
}

/**
 * We assume this is coming in as "+1 (617) 555-1234" because that's what the
 * form field validator and mask generate. But the backend wants just a +1 and
 * then the 10 digits, so we need to strip the hyphens and parens and spaces.
 */
export function normalizePhoneNumber(num: string) {
  return '+' + num.replace(/\W/g, '');
}
