import AWS from 'aws-sdk';
import HttpsProxyAgent from 'https-proxy-agent';
import elasticsearch, {
  SearchResponse,
  BulkIndexDocumentsParams,
} from 'elasticsearch';
import HttpAwsEs from 'http-aws-es';
import _ from 'lodash';

import { DetailedServiceRequest } from './Open311';

interface IndexedCase {
  service_request_id: string;
  status: string;
  location: {
    lat: number;
    lon: number;
  } | null;

  address: string;
  description: string;
  service_name: string;
  service_code: string;
  status_notes: string;
  requested_datetime: string | undefined;
  updated_datetime: string | undefined;

  media_url:
    | Array<{
        url: string;
        tags: string[];
      }>
    | undefined;

  replay_id: number | null;
}

interface BulkResponse {
  took: number;
  items: Array<{
    [action: string]: {
      _index: string;
      _type: string;
      _id: string;
      _version?: number;
      status: number;
      error?: string | { type: string; reason: string };
    };
  }>;

  errors: boolean;
}

interface MaxReplayAggregations {
  max_replay_id: {
    value: number | undefined;
  };
}

function findMediaUrl(
  c: DetailedServiceRequest
): { url: string; tags: string[] }[] {
  const mediaUrls: Array<string | { url: string; tags: string[] }[]> = [];

  if (c.media_url) {
    mediaUrls.push(c.media_url);
  }

  (c.activities || []).forEach(a => {
    if (a.media_url) {
      mediaUrls.push(a.media_url);
    }
  });

  const firstMediaUrl = mediaUrls[0];
  return typeof firstMediaUrl === 'string'
    ? [{ url: firstMediaUrl, tags: [] as string[] }]
    : firstMediaUrl;
}

function convertCaseToDocument(
  c: DetailedServiceRequest,
  replayId: number | null
): IndexedCase {
  let location: IndexedCase['location'] = null;

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
  private readonly client: elasticsearch.Client;
  private readonly index: string;

  constructor(url: string | undefined, index: string | undefined) {
    if (!url) {
      throw new Error('Missing Elasticsearch url');
    }

    if (!index) {
      throw new Error('Missing Elasticsearch index name');
    }

    this.client = new elasticsearch.Client({
      host: url,
      connectionClass: url.endsWith('.amazonaws.com') ? HttpAwsEs : undefined,
      createNodeAgent: process.env.http_proxy
        ? () => new HttpsProxyAgent(process.env.http_proxy)
        : undefined,
    });

    this.index = index;
  }

  public static configureAws(region: string | undefined) {
    if (!region) {
      throw new Error('Missing AWS region');
    }

    AWS.config.update({ region });
  }

  public async initIndex(): Promise<void> {
    const indexExists = await new Promise<boolean>((resolve, reject) => {
      this.client.indices.get(
        {
          index: this.index,
        },

        err => {
          if (err) {
            if (err.statusCode === 404) {
              resolve(false);
            } else {
              reject(err);
            }
          } else {
            resolve(true);
          }
        }
      );
    });

    if (indexExists) {
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

  public info(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.info({}, (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      });
    });
  }

  public async findLatestReplayId(): Promise<number | null> {
    const res: SearchResponse<unknown> = await this.client.search({
      index: this.index,
      type: 'case',
      body: {
        size: 0,
        aggregations: {
          max_replay_id: { max: { field: 'replay_id' } },
        },
      },
    });

    return (
      (res.aggregations &&
        (res.aggregations as MaxReplayAggregations).max_replay_id.value) ||
      null
    );
  }

  public async createCases(
    cases: Array<{
      id: string;
      case: DetailedServiceRequest | null;
      replayId: number | null;
    }>
  ): Promise<BulkResponse> {
    if (cases.length === 0) {
      return {
        took: 0,
        items: [],
        errors: false,
      };
    }

    const actions: BulkIndexDocumentsParams['body'] = [];

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
            .map(error =>
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
  }
}
