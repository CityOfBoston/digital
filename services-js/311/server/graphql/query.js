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

type RequestsPage {
  requests: [Request!]!
  query: String!
  currentPage: Int!
  totalPages: Int!
}

type Query {
  services: [Service!]!
  topServices(first: Int): [Service!]!
  servicesForDescription(text: String!, max: Int, threshold: Float): [Service!]!
  service(code: String!): Service
  request(id: String!): Request
  requests(page: Int, query: String, location: LatLngIn, radiusKm: Float): RequestsPage!
  geocoder: Geocoder!
}
`;

type SuggestionsArgs = {
  text: string,
  max: ?number,
  threshold: ?number,
}

type RequestsArgs = {
  page: ?number,
  query: ?string,
  location: ?{
    lat: number,
    lng: number,
  },
  radiusKm: ?number,
};

type RequestsPage = {
  requests: Request[],
  query: string,
  currentPage: number,
  totalPages: number,
};

const TOP_SERVICE_CODES = [
  'PUDEADANML',
  'ILGLDUMP',
  'NEEDRMVL',
  'ILGLPRKING',
  'STCKRREQ',
];

async function serviceSuggestions({ open311, prediction }: Context, { text, max, threshold }: SuggestionsArgs): Promise<Service[]> {
  const [suggestions, services] = await Promise.all([prediction.caseTypes(text, threshold || 0), open311.services()]);

  const matchedServices: Service[] = [];
  // "type" here is the name of the service
  suggestions.forEach(({ sf_type_id }) => {
    const matchedService = services.find(({ service_code }) => service_code === sf_type_id);
    if (matchedService) {
      matchedServices.push(matchedService);
    }
  });

  return matchedServices.slice(0, max || 5);
}

export const resolvers = {
  Query: {
    services: (root: mixed, args: mixed, { open311 }: Context): Promise<Service[]> => open311.services(),
    topServices: async (root: mixed, { first }: {first: ?number}, { open311 }: Context): Promise<Service[]> => (
      (await open311.services()).filter(({ service_code }) => TOP_SERVICE_CODES.indexOf(service_code) !== -1).slice(0, first || TOP_SERVICE_CODES.length)
    ),
    servicesForDescription: (root: mixed, args: SuggestionsArgs, context: Context): Promise<Service[]> => serviceSuggestions(context, args),
    service: (root: mixed, { code }: { code: string }, { open311 }: Context): Promise<?Service> => open311.service(code),
    request: (root: mixed, { id }: { id: string }, { publicOpen311 }: Context): Promise<?Request> => publicOpen311.request(id),
    requests: async (root: mixed, { page, query, location, radiusKm }: RequestsArgs, { swiftype, publicOpen311 }: Context): Promise<RequestsPage> => {
      const { requests: searchResults, info } = await swiftype.searchCases({ page, query, location, radiusKm });

      // cast to "any" because filter removed the null / undefineds from request
      const requests = ((await Promise.all(searchResults.map((r) => publicOpen311.request(r.service_request_id)))).filter((r) => !!r): any);

      return {
        requests,
        query: info.query,
        currentPage: info.current_page,
        totalPages: info.num_pages,
      };
    },
    geocoder: () => ({}),
  },
};
