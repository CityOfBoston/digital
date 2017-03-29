// @flow

import type { Context } from '.';
import type { Root as Service } from './service';
import type { Root as Request } from './request';

export const Schema = `
type RequestsPage {
  requests: [Request!]!
  query: String!
  currentPage: Int!
  totalPages: Int!
}

type Query {
  services: [Service!]!
  service(code: String!): Service
  request(id: String!): Request
  requests(page: Int, query: String, location: LatLngIn, radiusKm: Float): RequestsPage!
}
`;

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

export const resolvers = {
  Query: {
    services: (root: mixed, args: mixed, { open311 }: Context): Promise<Service[]> => open311.services(),
    service: (root: mixed, { code }: { code: string }, { open311 }: Context): Promise<?Service> => open311.service(code),
    request: (root: mixed, { id }: { id: string }, { open311 }: Context): Promise<?Request> => open311.request(id),
    requests: async (root: mixed, { page, query, location, radiusKm }: RequestsArgs, { swiftype }: Context): Promise<RequestsPage> => {
      const { requests, info } = await swiftype.searchCases({ page, query, location, radiusKm });
      return {
        requests,
        query: info.query,
        currentPage: info.current_page,
        totalPages: info.num_pages,
      };
    },
  },
};
