// @flow

import AWS from 'aws-sdk';
import elasticsearch from 'elasticsearch';
import HttpAwsEs from 'http-aws-es';

// This needs to be kept up-to-date with the 311-indexer
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
  replay_id: number,
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
      connectionClass: url.endsWith('.amazonaws.com') ? HttpAwsEs : undefined,
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

  searchCases(
    query: ?string,
    topLeft: ?{ lat: number, lng: number },
    bottomRight: ?{ lat: number, lng: number }
  ): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      const transaction =
        this.opbeat && this.opbeat.startTransaction('search', 'SearchBox');

      const must = [];
      const filter = [];

      if (query) {
        must.push({
          multi_match: {
            query: query || '',
            fields: ['description', 'service_name', '_id'],
          },
        });
      }

      if (topLeft && bottomRight) {
        filter.push({
          geo_bounding_box: {
            location: {
              top_left: {
                lat: topLeft.lat,
                lon: topLeft.lng,
              },
              bottom_right: {
                lat: bottomRight.lat,
                lon: bottomRight.lng,
              },
            },
          },
        });
      }

      this.client.search(
        {
          index: this.index,
          type: 'case',
          body: {
            size: 50,
            sort: [{ requested_datetime: 'desc' }],
            query: {
              bool: {
                must,
                filter,
              },
            },
          },
        },
        (err: ?Error, res: SearchResponse) => {
          if (transaction) {
            transaction.end();
          }

          if (err) {
            reject(err);
          } else {
            resolve(res.hits.hits.map(({ _id }) => _id));
          }
        }
      );
    });
  }
}
