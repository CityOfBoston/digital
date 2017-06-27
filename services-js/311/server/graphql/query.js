// @flow
/* eslint camelcase: 0 */

import type { Context } from '.';
import type { Service } from '../services/Open311';
import type { Root as Request } from './request';

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
  cases: [Request!]!
  query: String!
}

type Query {
  services: [Service!]!
  topServices(first: Int): [Service!]!
  servicesForDescription(text: String!, max: Int, threshold: Float): [Service!]!
  service(code: String!): Service
  case(id: String!): Request
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
  cases: Request[],
  query: string,
};

const TOP_SERVICE_CODES = [
  'PUDEADANML',
  'ILGLDUMP',
  'NEEDRMVL',
  'ILGLPRKING',
  'STCKRREQ',
];

async function serviceSuggestions(
  { open311, prediction }: Context,
  { text, max, threshold }: SuggestionsArgs,
): Promise<Service[]> {
  const [suggestions, services] = await Promise.all([
    prediction.caseTypes(text, threshold || 0),
    open311.services(),
  ]);

  const matchedServices: Service[] = [];
  // "type" here is the name of the service
  suggestions.forEach(({ sf_type_id }) => {
    const matchedService = services.find(
      ({ service_code }) => service_code === sf_type_id,
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
      { open311 }: Context,
    ): Promise<Service[]> => open311.services(),
    topServices: async (
      root: mixed,
      { first }: { first: ?number },
      { open311 }: Context,
    ): Promise<Service[]> =>
      (await open311.services())
        .filter(
          ({ service_code }) => TOP_SERVICE_CODES.indexOf(service_code) !== -1,
        )
        .slice(0, first || TOP_SERVICE_CODES.length),
    servicesForDescription: (
      root: mixed,
      args: SuggestionsArgs,
      context: Context,
    ): Promise<Service[]> => serviceSuggestions(context, args),
    service: (
      root: mixed,
      { code }: { code: string },
      { open311 }: Context,
    ): Promise<?Service> => open311.service(code),
    case: (
      root: mixed,
      { id }: { id: string },
      { publicOpen311 }: Context,
    ): Promise<?Request> => publicOpen311.request(id),
    searchCases: async (
      root: mixed,
      { query, topLeft, bottomRight }: SearchCasesArgs,
      { publicOpen311, searchBox }: Context,
    ): Promise<CaseSearchResults> => {
      const ids = await searchBox.searchCases(query, topLeft, bottomRight);

      // cast to "any" because filter removed the null / undefineds from request
      const cases = ((await Promise.all(
        ids.map(id => publicOpen311.request(id)),
      )).filter(r => !!r): any);

      return {
        cases,
        query: query || '',
      };
    },
    geocoder: () => ({}),
  },
};
