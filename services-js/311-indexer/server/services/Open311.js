// @flow

import fetch from 'node-fetch';
import URLSearchParams from 'url-search-params';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent';
import moment from 'moment';

export type Case = {|
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

export type DetailedServiceRequest = {|
  id: string,
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
  address_details: ?string,
  zipcode: ?string,
  reported_location: ?{
    address: ?string,
    address_id: ?string,
    lat: ?number,
    long: ?number,
  },
  address_id: ?string,
  agency_responsible: ?string,
  service_notice: ?string,
  status_notes: ?string,
  service_notice: ?string,
  duplicate_parent_service_request_id: ?string,
  parent_service_request_id: ?string,
  origin: ?string,
  source: ?string,
  priority: string,
  service_level_agreement: Object,
  owner: Object,
  contact: {
    first_name: ?string,
    last_name: ?string,
    phone: ?string,
    email: ?string,
  },
  closure_details: {
    reason: ?string,
    comment: ?string,
  },
  activities: Array<ServiceRequestActivity>,
  attributes: Array<Object>,
  events: Array<Object>,
|};

export type ServiceRequestActivity = {|
  code: string,
  order: number,
  description: ?string,
  status: 'Complete' | 'Void',
  // 2017-08-16T14:24:02.000Z
  completion_date: ?string,
  media_url?: Array<{|
    url: string,
    tags: Array<string>,
  |}>,
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
  oauthSessionId: ?string;

  constructor(endpoint: ?string, apiKey: ?string, opbeat: any) {
    if (!endpoint) {
      throw new Error('Must specify an Open311 endpoint');
    }

    this.endpoint = endpoint;
    this.apiKey = apiKey;

    this.opbeat = opbeat;

    this.oauthSessionId = null;

    if (process.env.http_proxy) {
      this.agent = new HttpsProxyAgent(process.env.http_proxy);
    }
  }

  url(path: string) {
    return url.resolve(this.endpoint, path);
  }

  requestHeaders() {
    const headers = {};

    if (this.oauthSessionId) {
      // We don't bother tracking if this 401s and we fail, since we assume that
      // the Salesforce event stream will error out before this does, or at
      // least shortly thereafter (which triggers a process restart).
      headers.Authorization = `Bearer ${this.oauthSessionId}`;
    }

    return headers;
  }

  async searchCases(startDate?: Date, endDate?: Date): Promise<Array<Case>> {
    const transaction = this.opbeat.startTransaction('searchCases', 'Open311');

    const params = new URLSearchParams();

    if (startDate && endDate) {
      // We need a range of <= 90 days. Since the results are sorted from the
      // endDate, we just move up the startDate. This will generally be ok for
      // bulk import, since it shouldn't be the case where there's a 90 day gap
      // in cases.
      const ninetyDaysBefore = moment(endDate).subtract(90, 'days');
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
    const caseArr: Case[] = await processResponse(response);

    if (transaction) {
      transaction.end();
    }

    return caseArr;
  }

  async loadCases(ids: Array<string>): Promise<Array<?Case>> {
    const transaction = this.opbeat.startTransaction(
      'bulk-requests',
      'Open311'
    );

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

    if (transaction) {
      transaction.end();
    }

    const casesById = {};

    caseArr.forEach(c => {
      casesById[c.service_request_id] = c;
    });

    return ids.map(id => casesById[id]);
  }

  async loadCase(id: string): Promise<?DetailedServiceRequest> {
    const { opbeat } = this;

    const params = new URLSearchParams();
    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

    const transaction = opbeat && opbeat.startTransaction('request', 'Open311');

    try {
      const response = await fetch(
        this.url(`request/${id}.json?${params.toString()}`),
        {
          agent: this.agent,
          headers: this.requestHeaders(),
        }
      );

      // For whatever reason, looking up a single request ID still returns
      // an array.
      const requestArr: Array<?DetailedServiceRequest> = await processResponse(
        response
      );

      // processResponse turns 404s into nulls
      if (requestArr) {
        return requestArr[0];
      } else {
        return null;
      }
    } finally {
      if (transaction) {
        transaction.end();
      }
    }
  }
}
