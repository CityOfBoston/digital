/**
 * @file This file defines the GraphQL schema and resolvers for our server.
 *
 * Run `npm run generate-graphql-schema` to use `ts2gql` to turn this file into
 * the `schema.graphql` file that can be consumed by other tools.
 *
 * The output is generated in the “graphql” directory in the package root so
 * that it can be `readFileSync`’d from both `build` (during dev and production)
 * and `src` (during test).
 */

import fs from 'fs';
import path from 'path';

import { makeExecutableSchema } from 'graphql-tools';
import { Resolvers, FieldArgs } from '@cityofboston/graphql-common';

import CommissionsDao from '../dao/CommissionsDao';

/** @graphql schema */
export interface Schema {
  query: QueryRoot;
}

export interface QueryRoot {
  commissions: Commission[];
  commission(args: { id: string }): Commission;
}

export interface Commission {
  name: string;
  contact: string;
}

// This file is built by the "generate-schema" script.
const schemaGraphql = fs.readFileSync(
  path.resolve(__dirname, '..', '..', '..', 'graphql', 'schema.graphql'),
  'utf-8'
);

export interface Context {
  commissions: CommissionsDao;
}

const queryRootResolvers = {
  commissions: () => [
    {
      name: 'test',
      contact: '321',
    },
  ],
  commission: (_, { id }: FieldArgs<QueryRoot['commission']>) => ({
    name: 'commission',
    contact: `everyone-${id}`,
  }),
};

export default makeExecutableSchema({
  typeDefs: [schemaGraphql],
  resolvers: {
    QueryRoot: queryRootResolvers as Resolvers<QueryRoot, null, Context>,
  },
  allowUndefinedInResolve: false,
});
