// @flow

import AWS from 'aws-sdk';
import elasticsearch from 'elasticsearch';
import HttpAwsEs from 'http-aws-es';
import HttpsProxyAgent from 'https-proxy-agent';

// This needs to be kept up-to-date with the 311-indexer
type CaseDocument = {|
  status: string,
  location: ?{
    lat: number,
    lon: number,
  },
  address: string,
  description: string,
  service_name: string,
  service_code: ?string,
  status_notes: string,
  requested_datetime: ?string,
  updated_datetime: ?string,
  replay_id: number,
  media_url: ?string,
|};

export type IndexedCase = {
  service_request_id: string,
  ...CaseDocument,
};

type SearchHit<S> = {
  _index: string,
  _type: string,
  _id: string,
  _score: number,
  _source: S,
};

type SearchResponse<S> = {
  _shards: {
    total: number,
    successful: number,
    failed: number,
  },
  hits: {
    total: number,
    max_score: number,
    hits: Array<SearchHit<S>>,
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

    const httpProxyUrl = process.env.http_proxy;
    const httpOptions = {
      agent: httpProxyUrl ? new HttpsProxyAgent(httpProxyUrl) : undefined,
    };

    AWS.config.update({
      region,
      httpOptions,
    });
  }

  // Returns an array of IDs for matching cases
  async searchCases(
    query: ?string,
    topLeft: ?{ lat: number, lng: number },
    bottomRight: ?{ lat: number, lng: number }
  ): Promise<Array<IndexedCase>> {
    const transaction =
      this.opbeat && this.opbeat.startTransaction('search', 'Elasticsearch');

    const must = [];
    const filter = [];

    if (query) {
      must.push({
        multi_match: {
          query: query || '',
          fields: ['description', 'service_name'],
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

    try {
      const res: SearchResponse<CaseDocument> = await this.client.search({
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
      });

      return res.hits.hits.map(h => ({
        service_request_id: h._id,
        ...h._source,
      }));
    } finally {
      if (transaction) {
        transaction.end();
      }
    }
  }
}
