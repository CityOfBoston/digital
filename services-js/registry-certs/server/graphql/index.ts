import { makeExecutableSchema } from 'graphql-tools';
import { NodeStripe } from 'stripe';
import Rollbar from 'rollbar';

import { Schema as QuerySchema, resolvers as queryResolvers } from './query';
import {
  Schema as MutationSchema,
  resolvers as mutationResolvers,
} from './mutation';
import {
  Schema as DeathSchema,
  resolvers as deathResolvers,
} from './death-certificates';

import RegistryData from '../services/RegistryData';
import RegistryOrders from '../services/RegistryOrders';
import Emails from '../services/Emails';

export interface Context {
  rollbar: Rollbar;
  registryData: RegistryData;
  registryOrders: RegistryOrders;
  stripe: NodeStripe;
  emails: Emails;
}

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
  } as any,
  allowUndefinedInResolve: false,
});
