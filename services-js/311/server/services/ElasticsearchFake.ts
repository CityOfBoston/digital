import Elasticsearch, { IndexedCase } from './Elasticsearch';

import ELASTICSEARCH_FIXTURE from './__fixtures__/elasticsearch.json';

export default class ElasticsearchFake implements Required<Elasticsearch> {
  public async searchCases(
    query: string | undefined,
    topLeft: { lat: number; lng: number } | undefined,
    bottomRight: { lat: number; lng: number } | undefined
  ): Promise<IndexedCase[]> {
    return ELASTICSEARCH_FIXTURE.filter(
      ({ description }) => !query || description.includes(query)
    ).map(c =>
      topLeft && bottomRight
        ? {
            ...c,
            location: {
              lat: (topLeft.lat + bottomRight.lat) / 2,
              lon: (topLeft.lng + bottomRight.lng) / 2,
            },
          }
        : c
    );
  }
}
