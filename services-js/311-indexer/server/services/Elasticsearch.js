// @flow

import AWS from 'aws-sdk';
import elasticsearch from 'elasticsearch';
import HttpAwsEs from 'http-aws-es';
import _ from 'lodash';

import type { DetailedServiceRequest } from './Open311';

type IndexedCase = {
  service_request_id: string,
  status: string,
  location: ?{
    lat: number,
    lon: number,
  },
  address: string,
  description: string,
  service_name: string,
  service_code: string,
  status_notes: string,
  requested_datetime: ?string,
  updated_datetime: ?string,
  // Must be the array format because Elasticsearch can't do both object and
  // string for the same field.
  media_url: ?Array<{|
    url: string,
    tags: string[],
  |}>,
  // We store the Salesforce replay_id in the record so we can pull the latest
  // replay_id when we start up, to avoid always processing everything from the
  // past 24 hours.
  //
  // This will be null for bulk-imported cases.
  replay_id: ?number,
};

type BulkResponse = {
  took: number,
  items: Array<{
    [action: string]: {
      _index: string,
      _type: string,
      _id: string,
      _version?: number,
      status: number,
      error?: string,
    },
  }>,
  errors: boolean,
};

type SearchResponse<H, A> = {
  _shards: {
    total: number,
    successful: number,
    failed: number,
  },
  hits: {
    total: number,
    max_score: number,
    hits: Array<H>,
    took: number,
    timed_out: boolean,
  },
  aggregations?: A,
};

type MaxReplayAggregations = {
  max_replay_id: {
    value: ?number,
  },
};

function findMediaUrl(c: DetailedServiceRequest) {
  const mediaUrls = [];
  if (c.media_url) {
    mediaUrls.push(c.media_url);
  }

  (c.activities || []).forEach(a => {
    mediaUrls.push(a.media_url);
  });

  const firstMediaUrl = mediaUrls[0];
  return typeof firstMediaUrl === 'string'
    ? [{ url: firstMediaUrl, tags: [] }]
    : firstMediaUrl;
}

function convertCaseToDocument(
  c: DetailedServiceRequest,
  replayId: ?number
): IndexedCase {
  let location = null;

  // We prefer reported_location since it is not affected by any transformations
  // the Salesforce code does to addresses.
  if (
    c.reported_location &&
    c.reported_location.lat &&
    c.reported_location.long
  ) {
    location = {
      lat: c.reported_location.lat,
      lon: c.reported_location.long,
    };
  } else if (c.lat && c.long) {
    location = { lat: c.lat, lon: c.long };
  }

  return {
    service_request_id: c.service_request_id,
    status: c.status,
    location,
    address: c.address || '',
    description: c.description || '',
    service_name: c.service_name || '',
    service_code: c.service_code || '',
    status_notes: c.status_notes || '',
    requested_datetime: c.requested_datetime,
    updated_datetime: c.updated_datetime || c.requested_datetime,
    media_url: findMediaUrl(c),
    replay_id: replayId,
  };
}

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

  async initIndex(): Promise<void> {
    const index = await new Promise((resolve, reject) => {
      this.client.indices.get(
        {
          index: this.index,
        },
        (err, resp) => {
          if (err) {
            if (err.statusCode === 404) {
              resolve(null);
            } else {
              reject(err);
            }
          } else {
            resolve(resp);
          }
        }
      );
    });

    if (index) {
      await new Promise((resolve, reject) => {
        this.client.indices.delete(
          {
            index: this.index,
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

    await new Promise((resolve, reject) => {
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

  async findLatestReplayId(): Promise<?number> {
    const transaction =
      this.opbeat &&
      this.opbeat.startTransaction('search-replay-id', 'Elasticsearch');

    try {
      const res: SearchResponse<
        *,
        MaxReplayAggregations
      > = await this.client.search({
        index: this.index,
        type: 'case',
        body: {
          size: 0,
          aggregations: {
            max_replay_id: { max: { field: 'replay_id' } },
          },
        },
      });

      return res.aggregations && res.aggregations.max_replay_id.value;
    } finally {
      if (transaction) {
        transaction.end();
      }
    }
  }

  async createCases(
    cases: Array<{|
      id: string,
      case: ?DetailedServiceRequest,
      replayId: ?number,
    |}>
  ): Promise<BulkResponse> {
    if (cases.length === 0) {
      return {
        took: 0,
        items: [],
        errors: false,
      };
    }

    const transaction =
      this.opbeat && this.opbeat.startTransaction('bulk', 'Elasticsearch');

    const actions = [];

    cases.forEach(({ id, case: c, replayId }) => {
      if (c) {
        const doc = convertCaseToDocument(c, replayId);

        actions.push({
          update: {
            _index: this.index,
            _type: 'case',
            _id: id,
          },
        });

        actions.push({
          doc,
          doc_as_upsert: true,
        });
      } else {
        actions.push({
          delete: { _index: this.index, _type: 'case', _id: id },
        });
      }
    });

    try {
      const res: BulkResponse = await this.client.bulk({ body: actions });
      if (!res) {
        throw new Error('unknown error: no response');
      } else if (res.errors) {
        throw new Error(
          'Errors indexing cases: \n' +
            _(res.items)
              // action is 'update' from above
              .map(
                item =>
                  (item.update ? item.update.error : null) ||
                  (item.delete ? item.delete.error : null)
              )
              .compact()
              .map(
                error =>
                  typeof error === 'string'
                    ? error
                    : `${error.type}: ${error.reason}`
              )
              .uniq()
              .join('\n')
        );
      } else {
        return res;
      }
    } finally {
      if (transaction) {
        transaction.end();
      }
    }
  }
}
