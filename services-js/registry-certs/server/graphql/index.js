// @flow

import { makeExecutableSchema } from 'graphql-tools';
import type { NodeStripe } from 'stripe';

import { Schema as QuerySchema, resolvers as queryResolvers } from './query';
import {
  Schema as MutationSchema,
  resolvers as mutationResolvers,
} from './mutation';
import {
  Schema as DeathSchema,
  resolvers as deathResolvers,
} from './death-certificates';

import type Registry from '../services/Registry';

export type Context = {|
  registry: Registry,
  stripe: NodeStripe,
|};

const SchemaDefinition = `
schema {
  query: Query,
  mutation: Mutation,
}
`;

export default makeExecutableSchema({
  typeDefs: [SchemaDefinition, QuerySchema, MutationSchema, DeathSchema],
  resolvers: {
    ...queryResolvers,
    ...mutationResolvers,
    ...deathResolvers,
  },
  allowUndefinedInResolve: false,
});
