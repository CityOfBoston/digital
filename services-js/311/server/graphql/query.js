// @flow

import type { Context } from '.';
import type { Root as Service } from './service';

export const Schema = `
type Query {
  services: [Service!]!
  service(code: String!): Service
}
`;

export const resolvers = {
  Query: {
    services: (root: mixed, args: mixed, { open311 }: Context): Promise<Service[]> => open311.services(),
    service: (root: mixed, { code }: { code: string }, { open311 }: Context): Promise<?Service> => open311.service(code),
  },
};
