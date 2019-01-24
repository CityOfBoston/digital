import fs from 'fs';
import path from 'path';
import { GraphQLScalarType, Kind } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import Stripe from 'stripe';
import Rollbar from 'rollbar';

import { Query, resolvers as queryResolvers } from './query';
import { Mutation, resolvers as mutationResolvers } from './mutation';
import { resolvers as deathResolvers } from './death-certificates';

import RegistryDb from '../services/RegistryDb';
import Emails from '../services/Emails';

// This file is built by the "generate-graphql-schema" script from
// the above interfaces.
const schemaGraphql = fs.readFileSync(
  path.resolve(
    // Normalize between dev and compiled file locations
    __dirname.replace('/registry-certs/build/', '/registry-certs/'),
    '../../graphql',
    'schema.graphql'
  ),
  'utf-8'
);

export interface Context {
  rollbar: Rollbar;
  registryDb: RegistryDb;
  stripe: Stripe;
  emails: Emails;
}

/** @graphql schema */
export interface Schema {
  query: Query;
  mutation: Mutation;
}

const dateResolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description:
      'JavaScript Date as an ISO string or number of millis since Epoch',
    parseValue(value: any): Date | null {
      if (typeof value === 'string' || typeof value === 'number') {
        return new Date(value);
      } else {
        return null;
      }
    },
    parseLiteral(ast): Date | null {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value); // ast value is always in string format
      } else if (ast.kind === Kind.INT) {
        return new Date(parseInt(ast.value, 10));
      } else {
        return null;
      }
    },
    serialize(value: Date) {
      return value.toISOString();
    },
  }),
};

export default makeExecutableSchema({
  typeDefs: [schemaGraphql],
  resolvers: {
    ...queryResolvers,
    ...mutationResolvers,
    ...deathResolvers,
    ...dateResolvers,
  } as any,
  allowUndefinedInResolve: false,
});
