import fs from 'fs';
import path from 'path';
import { makeExecutableSchema } from 'graphql-tools';
import { NodeStripe } from 'stripe';
import Rollbar from 'rollbar';

import { Query, resolvers as queryResolvers } from './query';
import { Mutation, resolvers as mutationResolvers } from './mutation';
import { resolvers as deathResolvers } from './death-certificates';

import RegistryData from '../services/RegistryData';
import RegistryOrders from '../services/RegistryOrders';
import Emails from '../services/Emails';

// This file is built by the "generate-graphql-schema" script from
// the above interfaces.
const schemaGraphql = fs.readFileSync(
  path.resolve('graphql', 'schema.graphql'),
  'utf-8'
);

export interface Context {
  rollbar: Rollbar;
  registryData: RegistryData;
  registryOrders: RegistryOrders;
  stripe: NodeStripe;
  emails: Emails;
}

/** @graphql schema */
export interface Schema {
  query: Query;
  mutation: Mutation;
}

export default makeExecutableSchema({
  typeDefs: [schemaGraphql],
  resolvers: {
    ...queryResolvers,
    ...mutationResolvers,
    ...deathResolvers,
  } as any,
  allowUndefinedInResolve: false,
});
