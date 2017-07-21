// @flow

import AWS from 'aws-sdk';
import elasticsearch from 'elasticsearch';
import HttpAwsEs from 'http-aws-es';

export type IndexedCase = {
  status: string,
  location: ?{
    lat: number,
    lon: number,
  },
  address: string,
  description: string,
  service_name: string,
  status_notes: string,
  requested_datetime: string,
  updated_datetime: string,
};

export type BulkResponse = {
  took: number,
  items: Array<Object>,
  errors: boolean,
};

export type SearchHit = {
  _index: string,
  _type: string,
  _id: string,
  _score: number,
  _source: IndexedCase,
};

export type SearchResponse = {
  _shards: {
    total: number,
    successful: number,
    failed: number,
  },
  hits: {
    total: number,
    max_score: number,
    hits: Array<SearchHit>,
    took: 5,
    timed_out: boolean,
  },
};

// function convertRequestToDocument(request: ServiceRequest): IndexedCase {
//   return {
//     status: request.status,
//     location: request.lat && request.long
//       ? { lat: request.lat, lon: request.long }
//       : null,
//     address: request.address || '',
//     description: request.description || '',
//     service_name: request.service_name || '',
//     status_notes: request.status_notes || '',
//     requested_datetime: request.requested_datetime,
//     updated_datetime: request.updated_datetime,
//   };
// }

export default class Elasticsearch {
  opbeat: any;
  client: elasticsearch.Client;
  index: string;

  constructor(url: ?string, index: ?string, opbeat: any) {
    if (!url) {
      throw new Error('Missing Elasticsearch url');
    }

    if (!index) {
      throw new Error('Missing Elasticsearch index name');
    }

    this.client = new elasticsearch.Client({
      host: url,
      connectionClass: HttpAwsEs,
    });

    this.index = index;
    this.opbeat = opbeat;
  }

  static configureAws(region: ?string) {
    if (!region) {
      throw new Error('Missing AWS region');
    }

    AWS.config.update({ region });
  }

  initIndex(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.indices.create(
        {
          index: this.index,
          body: {
            mappings: {
              case: {
                properties: {
                  location: { type: 'geo_point' },
                },
              },
            },
          },
        },
        err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  info(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.info((err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      });
    });
  }

  // createCases(requests: ServiceRequest[]): Promise<BulkResponse> {
  //   return new Promise((resolve, reject) => {
  //     const transaction =
  //       this.opbeat && this.opbeat.startTransaction('bulk', 'SearchBox');

  //     const actions = [];

  //     requests.forEach((request: ServiceRequest) => {
  //       const doc = convertRequestToDocument(request);

  //       actions.push({
  //         update: {
  //           _index: this.index,
  //           _type: 'case',
  //           _id: request.service_request_id,
  //         },
  //       });

  //       actions.push({
  //         doc,
  //         doc_as_upsert: true,
  //       });
  //     });

  //     this.client.bulk({ body: actions }, (err: ?Error, res: BulkResponse) => {
  //       if (transaction) {
  //         transaction.end();
  //       }

  //       if (err || !res) {
  //         reject(err || 'unknown error: no response');
  //       } else {
  //         resolve(res);
  //       }
  //     });
  //   });
  // }
}
