import fetch from 'node-fetch';
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
  long: number | null;
  lat: number | null;

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
  description: string | null;

  requested_datetime: string | null;
  expected_datetime: string | null;
  updated_datetime: string | null;
  address: string | null;
  address_details: string | null;
  zipcode: string | null;
  reported_location: {
    address: string | null;
    address_id: string | null;
    lat: number | null;
    long: number | null;
  } | null;

  address_id: string | null;
  agency_responsible: string | null;
  service_notice: string | null;
  status_notes: string | null;
  duplicate_parent_service_request_id: string | null;
  parent_service_request_id: string | null;
  origin: string | null;
  source: string | null;
  priority: string;
  service_level_agreement: any;
  owner: any;
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
  attributes: any[];
  events: any[];
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
  private readonly agent: any;
  private readonly salesforce: Salesforce | null;
  private readonly endpoint: string;
  private readonly apiKey: string | undefined;

  private readonly serviceLoader: DataLoader<string, Service | null>;
  private readonly serviceMetadataLoader: DataLoader<string, ServiceMetadata>;
  private readonly requestLoader: DataLoader<
    string,
    ServiceRequest | DetailedServiceRequest | null
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

            return await processResponse(response);
          } catch (e) {
            return new Error(
              `Error loading metadata for ${code}: ${e.toString()}`
            );
          }
        })
      );

      return out;
    });

    this.requestLoader = new DataLoader(async (ids): Promise<
      Array<ServiceRequest | DetailedServiceRequest | null>
    > => {
      const params = new URLSearchParams();
      if (this.apiKey) {
        params.append('api_key', this.apiKey);
      }

      if (ids.length === 1) {
        // The <case_id>.json endpoint is currently significantly faster than
        // the bulk endpoint, even for a single case, so we optimize by using
        // it when there's only one thing to look up.
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
    });
  }

  private fetch(url: string, opts?: any) {
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

  public serviceMetadata(code: string): Promise<ServiceMetadata> {
    return this.serviceMetadataLoader.load(code);
  }

  public request(
    id: string
  ): Promise<ServiceRequest | DetailedServiceRequest | null> {
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

    return (await processResponse(response))[0];
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
