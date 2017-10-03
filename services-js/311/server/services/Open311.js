// @flow

import 'isomorphic-fetch';
import URLSearchParams from 'url-search-params';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent';
import DataLoader from 'dataloader';
import type Salesforce from './Salesforce';

// types taken from Open311
export type Service = {|
  service_code: string,
  service_name: ?string,
  description: string,
  metadata: boolean,
  type: 'realtime' | 'batch' | 'blackbox',
  keywords: ?string,
  group: string,
|};

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

export type Validation = {|
  dependentOn: DependentConditions,
  message?: string,
  reportOnly?: boolean,
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
  // currently a bug where sometimes this is a number!?!
  values?: ServiceMetadataAttributeValue[] | number,
  dependencies?: DependentConditions,
  validations?: Array<Validation>,
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
  |},
|};

// Returned by the bulk endpoint and posting the submission.
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
  requested_datetime: ?string,
  updated_datetime: ?string,
  expected_datetime: ?string,
  address: ?string,
  address_id: ?string,
  zipcode: ?string,
  lat: ?number,
  long: ?number,
  media_url: ?string,
|};

// Returned by the single-request endpoint and posting the submission.
export type DetailedServiceRequest = {|
  service_request_id: string,
  status: string,
  long: ?number,
  lat: ?number,
  // Yes this can be an array or a string, depending on whether or not the case
  // was imported.
  media_url:
    | ?Array<{|
        url: string,
        tags: string[],
      |}>
    | ?string,
  service_name: ?string,
  service_code: string,
  description: ?string,
  // 2017-08-16T14:24:02.000Z
  requested_datetime: ?string,
  expected_datetime: ?string,
  updated_datetime: ?string,
  address: ?string,
  zipcode: ?string,
  address_id: ?string,
  agency_responsible: ?string,
  service_notice: ?string,
  status_notes: ?string,
  contact: {
    first_name: ?string,
    last_name: ?string,
    phone: ?string,
    email: ?string,
  },
  activities: Array<Object>,
  // [
  //   {
  //     code: 'NEEDRMVL-PICKUP',
  //     order: null,
  //     description: null,
  //     status: 'Not Started',
  //     completion_date: null,
  //   },
  // ],
  attributes: Array<Object>,
  // [
  //   {
  //     code: 'SR-NEDRMV1',
  //     description: 'How many needles are at the location?',
  //     order: 1,
  //     values: [
  //       {
  //         answer: 'One',
  //         answer_value: 'One',
  //       },
  //     ],
  //   },
  //   {
  //     code: 'ST-PROPLOC',
  //     description: 'Property location type',
  //     order: 2,
  //     values: [
  //       {
  //         answer: 'Public',
  //         answer_value: 'Public',
  //       },
  //     ],
  //   },
  // ],
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
  attributes: { code: string, value: string }[],
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
  salesforce: ?Salesforce;
  endpoint: string;
  apiKey: ?string;
  serviceLoader: DataLoader<string, ?Service>;
  serviceMetadataLoader: DataLoader<string, ?ServiceMetadata>;
  requestLoader: DataLoader<string, ?ServiceRequest | ?DetailedServiceRequest>;

  constructor(
    endpoint: ?string,
    apiKey: ?string,
    salesforce: ?Salesforce,
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
            const response = await fetch(
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

    this.requestLoader = new DataLoader(async (ids: string[]) => {
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
          const response = await fetch(
            this.url(`request/${ids[0]}.json?${params.toString()}`),
            {
              agent: this.agent,
            }
          );

          // For whatever reason, looking up a single request ID still returns
          // an array.
          const requestArr: Array<?DetailedServiceRequest> = await processResponse(
            response
          );

          // processResponse turns 404s into nulls
          if (requestArr) {
            return [requestArr[0]];
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

  fetch(url: string, opts?: Object) {
    if (this.salesforce) {
      return this.salesforce.authenticatedFetch(url, opts);
    } else {
      return fetch(url, opts);
    }
  }

  url(path: string) {
    return url.resolve(this.endpoint, path);
  }

  services = async (): Promise<Service[]> => {
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

  service(code: string): Promise<?Service> {
    return this.serviceLoader.load(code);
  }

  serviceMetadata(code: string): Promise<?ServiceMetadata> {
    return this.serviceMetadataLoader.load(code);
  }

  request(id: string): Promise<?ServiceRequest | ?DetailedServiceRequest> {
    return this.requestLoader.load(id);
  }

  requests = async () => {
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

  async createRequest(
    args: CreateServiceRequestArgs
  ): Promise<DetailedServiceRequest> {
    const params = new URLSearchParams();
    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

    Object.keys(args).forEach(key => {
      switch (key) {
        case 'lat':
        case 'long':
          if (args[key] !== undefined) {
            params.append(key, args[key].toString());
          }
          break;
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
