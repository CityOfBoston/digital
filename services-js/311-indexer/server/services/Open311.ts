import fetch, { Response } from 'node-fetch';
import URLSearchParams from 'url-search-params';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent';
import moment from 'moment';

export interface Case {
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
export interface DetailedServiceRequest {
  id: string;
  service_request_id: string;
  status: string;
  long: number | undefined;
  lat: number | undefined;

  media_url:
    | Array<{
        url: string;
        tags: string[];
      }>
    | undefined
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
    url: string;
    tags: string[];
  }>;
}

async function processResponse(res: Response): Promise<any> {
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

    throw Object.assign(new Error(message), {
      extra: {
        status: res.status,
        url: res.url,
      },
    });
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
  private readonly endpoint: string;
  private readonly apiKey: string | undefined;
  public oauthSessionId: string | null = null;

  constructor(endpoint: string | undefined, apiKey: string | undefined) {
    if (!endpoint) {
      throw new Error('Must specify an Open311 endpoint');
    }

    this.endpoint = endpoint;
    this.apiKey = apiKey;

    if (process.env.http_proxy) {
      this.agent = new HttpsProxyAgent(process.env.http_proxy);
    }
  }

  public url(path: string) {
    return url.resolve(this.endpoint, path);
  }

  public requestHeaders() {
    const headers: { [header: string]: string } = {};

    if (this.oauthSessionId) {
      // We don't bother tracking if this 401s and we fail, since we assume that
      // the Salesforce event stream will error out before this does, or at
      // least shortly thereafter (which triggers a process restart).
      headers.Authorization = `Bearer ${this.oauthSessionId}`;
    }

    return headers;
  }

  public async searchCases(startDate?: Date, endDate?: Date): Promise<Case[]> {
    const params = new URLSearchParams();

    if (startDate && endDate) {
      // We need a range of <= 90 days. We use 88 to give us lots of slop around
      // leap days and daylight savings changes. Since the results are sorted
      // from the endDate, we just move up the startDate. This will generally be
      // ok for bulk import, since it shouldn't be the case where there's a 88
      // day gap in cases.
      const ninetyDaysBefore = moment(endDate).subtract(88, 'days');
      if (moment(startDate).isBefore(ninetyDaysBefore)) {
        startDate = ninetyDaysBefore.toDate();
      }

      params.append('start_date', startDate.toISOString());
      params.append('end_date', endDate.toISOString());
    }

    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

    const response = await fetch(
      this.url(`requests.json?${params.toString()}`),
      {
        agent: this.agent,
        headers: this.requestHeaders(),
      }
    );

    // the endpoint returns the request in an array
    let caseArr: Case[];

    try {
      caseArr = await processResponse(response);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Error with search params: ${params.toString()}`);
      throw e;
    }

    return caseArr;
  }

  public async loadCases(ids: string[]): Promise<Array<Case | undefined>> {
    const params = new URLSearchParams();
    params.append('service_request_id', ids.join(','));

    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

    const response = await fetch(
      this.url(`requests.json?${params.toString()}`),
      {
        agent: this.agent,
        headers: this.requestHeaders(),
      }
    );

    // the endpoint returns the request in an array
    const caseArr: Case[] = await processResponse(response);

    const casesById = {};

    caseArr.forEach(c => {
      casesById[c.service_request_id] = c;
    });

    return ids.map(id => casesById[id]);
  }

  public async loadCase(id: string): Promise<DetailedServiceRequest | null> {
    const params = new URLSearchParams();
    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

    const response = await fetch(
      this.url(`request/${id}.json?${params.toString()}`),
      {
        agent: this.agent,
        headers: this.requestHeaders(),
      }
    );

    // For whatever reason, looking up a single request ID still returns
    // an array.
    const requestArr: Array<DetailedServiceRequest | null> = await processResponse(
      response
    );

    // processResponse turns 404s into nulls
    if (requestArr) {
      return requestArr[0];
    } else {
      return null;
    }
  }
}
