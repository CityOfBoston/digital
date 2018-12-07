import AWS from 'aws-sdk';
import elasticsearch from 'elasticsearch';
import HttpAwsEs from 'http-aws-es';
import HttpsProxyAgent from 'https-proxy-agent';

// This needs to be kept up-to-date with the 311-indexer
//
// TODO(finh): Factor this out to a place where they can share it directly.
interface CaseDocument {
  status: string;
  location: {
    lat: number;
    lon: number;
  } | null;

  address: string;
  description: string;
  service_name: string;
  service_code: string | null;
  status_notes: string;
  requested_datetime: string | null;
  updated_datetime: string | null;
  replay_id: number;
  media_url: string | null;
}

export interface IndexedCase extends CaseDocument {
  service_request_id: string;
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
    });

    this.index = index;
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
  }
}
