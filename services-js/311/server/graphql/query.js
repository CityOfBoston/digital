// @flow

import type { Context } from '.';
import type { Root as Service } from './service';
import type { Root as Request } from './request';

export const Schema = `
type RequestsPage {
  requests: [Request!]!
  currentPage: Int!
  totalPages: Int!
}

type Query {
  services: [Service!]!
  service(code: String!): Service
  request(id: String!): Request
  requests(page: Int, query: String): RequestsPage!
}
`;

type RequestsArgs = {
  page: ?number,
  query: ?string,
};

type RequestsPage = {
  requests: Request[],
  currentPage: number,
  totalPages: number,
};

export const resolvers = {
  Query: {
    services: (root: mixed, args: mixed, { open311 }: Context): Promise<Service[]> => open311.services(),
    service: (root: mixed, { code }: { code: string }, { open311 }: Context): Promise<?Service> => open311.service(code),
    request: (root: mixed, { id }: { id: string }, { open311 }: Context): Promise<?Request> => open311.request(id),
    requests: async (root: mixed, { page, query }: RequestsArgs, { swiftype }: Context): Promise<RequestsPage> => {
      const { requests, info } = await swiftype.searchCases({ page, query });
      return {
        requests,
        currentPage: info.current_page,
        totalPages: info.num_pages,
      };
    },
  },
};
