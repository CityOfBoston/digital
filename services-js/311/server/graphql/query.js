// @flow
/* eslint camelcase: 0 */

import type { Context } from '.';
import type { Service } from '../services/Open311';
import type { IndexedCase } from '../services/Elasticsearch';
import type { Root as CaseRoot } from './case';

export const Schema = `
type LatLng {
  lat: Float!
  lng: Float!
}

input LatLngIn {
  lat: Float!
  lng: Float!
}

type CaseSearchResults {
  cases: [Case!]!
  query: String!
}

type Query {
  services: [Service!]!
  topServices(first: Int): [Service!]!
  servicesForDescription(text: String!, max: Int, threshold: Float): [Service!]!
  service(code: String!): Service
  case(id: String!): Case
  searchCases(query: String, topLeft: LatLngIn, bottomRight: LatLngIn): CaseSearchResults!
  geocoder: Geocoder!
}
`;

type SuggestionsArgs = {
  text: string,
  max: ?number,
  threshold: ?number,
};

type SearchCasesArgs = {
  query: ?string,
  topLeft: ?{
    lat: number,
    lng: number,
  },
  bottomRight: ?{
    lat: number,
    lng: number,
  },
};

type CaseSearchResults = {
  cases: Array<IndexedCase>,
  query: string,
};

const TOP_SERVICE_CODES = [
  'RECCRTREQ',
  'PUDEADANML',
  'ILGLDUMP',
  'NEEDRMVL',
  'ILGLPRKING',
];

async function serviceSuggestions(
  { open311, prediction }: Context,
  { text, max, threshold }: SuggestionsArgs
): Promise<Service[]> {
  const [suggestions, services] = await Promise.all([
    prediction.caseTypes(text, threshold || 0),
    open311.services(),
  ]);

  const matchedServices: Service[] = [];
  // "type" here is the name of the service
  suggestions.forEach(({ sf_type_id }) => {
    const matchedService = services.find(
      ({ service_code }) => service_code === sf_type_id
    );
    if (matchedService) {
      matchedServices.push(matchedService);
    }
  });

  return matchedServices.slice(0, max || 5);
}

export const resolvers = {
  Query: {
    services: (
      root: mixed,
      args: mixed,
      { open311 }: Context
    ): Promise<Service[]> => open311.services(),

    topServices: async (
      root: mixed,
      { first }: { first: ?number },
      { open311 }: Context
    ): Promise<Service[]> =>
      (await open311.services())
        .filter(
          ({ service_code }) => TOP_SERVICE_CODES.indexOf(service_code) !== -1
        )
        .slice(0, first || TOP_SERVICE_CODES.length),

    servicesForDescription: (
      root: mixed,
      args: SuggestionsArgs,
      context: Context
    ): Promise<Service[]> => serviceSuggestions(context, args),

    service: (
      root: mixed,
      { code }: { code: string },
      { open311 }: Context
    ): Promise<?Service> => open311.service(code),

    case: (
      root: mixed,
      { id }: { id: string },
      { open311 }: Context
    ): Promise<?CaseRoot> => open311.request(id),

    searchCases: async (
      root: mixed,
      { query, topLeft, bottomRight }: SearchCasesArgs,
      { elasticsearch }: Context
    ): Promise<CaseSearchResults> => {
      const cases = await elasticsearch.searchCases(
        query,
        topLeft,
        bottomRight
      );

      return {
        cases,
        query: query || '',
      };
    },
    geocoder: () => ({}),
  },
};
