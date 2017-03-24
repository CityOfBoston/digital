// @flow

import { makeExecutableSchema } from 'graphql-tools';

import { Schema as QuerySchema, resolvers as queryResolvers } from './query';
import { Schema as MutationSchema, resolvers as mutationResolvers } from './mutation';
import { Schema as RequestSchema, resolvers as requestResolvers } from './request';
import { Schema as ServiceSchema, resolvers as serviceResolvers } from './service';

import type Open311 from '../services/Open311';
import type Swiftype from '../services/Swiftype';

export type Context = {|
  open311: Open311,
  swiftype: Swiftype,
|};

const SchemaDefinition = `
schema {
  query: Query,
  mutation: Mutation,
}
`;

export default makeExecutableSchema({
  typeDefs: [
    SchemaDefinition,
    QuerySchema,
    MutationSchema,
    RequestSchema,
    ServiceSchema,
  ],
  resolvers: {
    ...queryResolvers,
    ...mutationResolvers,
    ...requestResolvers,
    ...serviceResolvers,
  },
  allowUndefinedInResolve: false,
});
