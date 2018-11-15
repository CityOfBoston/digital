import AWS from 'aws-sdk';
import elasticsearch from 'elasticsearch';
import HttpAwsEs from 'http-aws-es';
import HttpsProxyAgent from 'https-proxy-agent';

// This needs to be kept up-to-date with the 311-indexer
interface CaseDocument {
  status: string;
  location:
    | {
        lat: number;
        lon: number;
      }
    | undefined;

  address: string;
  description: string;
  service_name: string;
  service_code: string | undefined;
  status_notes: string;
  requested_datetime: string | undefined;
  updated_datetime: string | undefined;
  replay_id: number;
  media_url: string | undefined;
}

export interface IndexedCase extends CaseDocument {
  service_request_id: string;
}

export class Elasticsearch {
  public readonly opbeat: any;
  public readonly client: elasticsearch.Client;
  public readonly index: string;

  constructor(url: string | undefined, index: string | undefined, opbeat: any) {
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

  public static configureAws(region: string | undefined) {
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
  public async searchCases(
    query: string | undefined,
    topLeft: { lat: number; lng: number } | undefined,
    bottomRight: { lat: number; lng: number } | undefined
  ): Promise<IndexedCase[]> {
    const transaction =
      this.opbeat && this.opbeat.startTransaction('search', 'Elasticsearch');

    const must: any[] = [];
    const filter: any[] = [];

    if (query) {
      must.push({
        multi_match: {
          query: query || '',
          fields: ['description', 'service_name', 'address'],
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
      const res = await this.client.search<CaseDocument>({
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
