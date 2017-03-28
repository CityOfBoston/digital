// @flow

import SwiftypeApi from 'swiftype';
import type { Document, SearchInfo } from 'swiftype';

import type { ServiceRequest } from './Open311';

function convertRequestToSwiftypeDocument(request: ServiceRequest): Document {
  return {
    external_id: request.service_request_id,
    fields: [
      { name: 'status', type: 'enum', value: request.status },
      { name: 'status_notes', type: 'text', value: request.status_notes || '' },
      { name: 'service_name', type: 'string', value: request.service_name || '' },
      { name: 'service_code', type: 'enum', value: request.service_code },
      { name: 'description', type: 'text', value: request.description || '' },
      { name: 'requested_datetime', type: 'date', value: request.requested_datetime },
      { name: 'updated_datetime', type: 'date', value: request.updated_datetime },
      { name: 'expected_datetime', type: 'date', value: request.expected_datetime || '' },
      { name: 'address', type: 'text', value: request.address || '' },
      { name: 'address_id', type: 'enum', value: request.address_id || '' },
      { name: 'location', type: 'location', value: { lat: request.lat, lon: request.long } },
      { name: 'media_url', type: 'enum', value: request.media_url || '' },
      { name: 'zipcode', type: 'enum', value: request.zipcode || '' },
    ],
  };
}

function convertCaseToServiceRequest(caseObj: Object): ServiceRequest {
  return {
    service_request_id: caseObj.external_id,
    status: caseObj.status,
    status_notes: caseObj.status_notes,
    service_name: caseObj.service_name,
    service_code: caseObj.service_code,
    description: caseObj.description,
    agency_responsible: null,
    service_notice: null,
    requested_datetime: caseObj.requested_datetime,
    updated_datetime: caseObj.updated_datetime,
    expected_datetime: caseObj.expected_datetime,
    address: caseObj.address,
    address_id: caseObj.address_id,
    zipcode: caseObj.zipcode,
    lat: caseObj.location.lat,
    long: caseObj.location.lon,
    media_url: caseObj.media_url,
  };
}

type SearchCasesArgs = {
  page: ?number,
  query: ?string,
  location: ?{
    lat: number,
    lng: number,
  },
  radiusKm: ?number,
}

export default class Swiftype {
  opbeat: any;
  swiftype: SwiftypeApi
  engine: string

  constructor(apiKey: ?string, engine: ?string, opbeat: any) {
    if (!apiKey || !engine) {
      throw new Error('Missing Swiftype API key or engine name');
    }

    this.opbeat = opbeat;
    this.swiftype = new SwiftypeApi({
      apiKey,
    });

    this.engine = engine;
  }

  createCases(requests: ServiceRequest[]): Promise<boolean[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.opbeat && this.opbeat.startTransaction('bulkCreate', 'Swiftype');

      const params = {
        engine: this.engine,
        documentType: 'cases',
        documents: requests.map(convertRequestToSwiftypeDocument),
      };

      this.swiftype.documents.bulkCreate(params, (err, res) => {
        if (transaction) {
          transaction.end();
        }

        if (err || !res) {
          reject(err);
        } else {
          resolve((res: boolean[]));
        }
      });
    });
  }

  searchCases({ page, query, location, radiusKm }: SearchCasesArgs): Promise<{ requests: ServiceRequest[], info: SearchInfo }> {
    return new Promise((resolve, reject) => {
      const transaction = this.opbeat && this.opbeat.startTransaction('search', 'Swiftype');

      const filters = {};
      if (location) {
        filters.cases = {
          location: {
            type: 'distance',
            max: `${Math.ceil(radiusKm || 5)}km`,
            lat: location.lat,
            lon: location.lng,
          },
        };
      }

      const params = {
        engine: this.engine,
        documentType: 'cases',
        q: query || '',
        page,
        filters,
        sort_field: { cases: 'updated_datetime' },
        sort_direction: { cases: 'desc' },
      };

      this.swiftype.documentTypes.search(params, (err, res) => {
        if (transaction) {
          transaction.end();
        }

        if (err || !res) {
          reject(err);
        } else {
          const { records, info } = res;

          resolve({
            requests: records.cases.map(convertCaseToServiceRequest),
            info: info.cases,
          });
        }
      });
    });
  }
}
