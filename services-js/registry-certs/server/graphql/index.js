// @flow

import { makeExecutableSchema } from 'graphql-tools';

import { Schema as QuerySchema, resolvers as queryResolvers } from './query';

export type Context = {
};

const SchemaDefinition = `
schema {
  query: Query,
}
`;

export default makeExecutableSchema({
  typeDefs: [
    SchemaDefinition,
    QuerySchema,
  ],
  resolvers: {
    ...queryResolvers,
  },
  allowUndefinedInResolve: false,
});
