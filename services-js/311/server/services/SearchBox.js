// @flow

import elasticsearch from 'elasticsearch';
import type { ServiceRequest } from './Open311';

function convertRequestToDocument(request: ServiceRequest): Object {
  return {
    status: request.status,
    location: { lat: request.lat, lon: request.long },
    address: request.address,
    description: request.description,
    service_name: request.service_name,
    status_notes: request.status_notes,
    requested_datetime: request.requested_datetime,
    updated_datetime: request.updated_datetime,
  };
}

export type BulkResponse = {
  took: number,
  items: Array<Object>,
  errors: boolean,
}

export default class ElasticSearch {
  opbeat: any;
  client: elasticsearch.Client;

  constructor(url: ?string, opbeat: any) {
    if (!url) {
      throw new Error('Missing SearchBox url');
    }

    this.client = new elasticsearch.Client({
      host: url,
    });

    this.opbeat = opbeat;
  }

  createCases(requests: ServiceRequest[]): Promise<BulkResponse> {
    return new Promise((resolve, reject) => {
      const transaction = this.opbeat && this.opbeat.startTransaction('bulk', 'SearchBox');

      const actions = [];

      requests.forEach((request: ServiceRequest) => {
        const doc = convertRequestToDocument(request);

        actions.push({
          update: {
            _index: '311',
            _type: 'case',
            _id: request.service_request_id,
          },
        });

        actions.push({
          doc,
          doc_as_upsert: true,
        });
      });

      this.client.bulk({ body: actions }, (err: ?Error, res: BulkResponse) => {
        if (transaction) {
          transaction.end();
        }

        if (err || !res) {
          reject(err || 'unknown error: no response');
        } else {
          resolve(res);
        }
      });
    });
  }
}
