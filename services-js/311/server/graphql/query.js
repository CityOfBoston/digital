// @flow

import type { Context } from '.';
import type { Root as Service } from './service';
import type { Root as Request } from './request';

export const Schema = `
type Query {
  services: [Service!]!
  service(code: String!): Service
  request(id: String!): Request
}
`;

export const resolvers = {
  Query: {
    services: (root: mixed, args: mixed, { open311 }: Context): Promise<Service[]> => open311.services(),
    service: (root: mixed, { code }: { code: string }, { open311 }: Context): Promise<?Service> => open311.service(code),
    request: (root: mixed, { id }: { id: string }, { open311 }: Context): Promise<?Request> => open311.request(id),
  },
};
