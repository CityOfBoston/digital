// @flow

import type { Context } from '.';

export const Schema = `
type Query {
  services: [Service!]!
  serviceMetadata(code: String!): ServiceMetadata
}
`;

export const resolvers = {
  Query: {
    services: (root: mixed, args: mixed, { open311 }: Context) => open311.services(),
    serviceMetadata: (root: mixed, { code }: { code: string }, { open311 }: Context) => open311.serviceMetadata(code),
  },
};
