/**
 * @file This file defines the GraphQL schema and resolvers for our server.
 *
 * Run `yarn generate-graphql-schema` to use `ts2gql` to turn this file into
 * the `schema.graphql` file that can be consumed by this and other tools.
 *
 * The output is generated in the “graphql” directory in the package root so
 * that it can be `readFileSync`’d from both `build` (during dev and production)
 * and `src` (during test).
 */

import fs from 'fs';
import path from 'path';

import { makeExecutableSchema } from 'apollo-server-hapi';
import Rollbar from 'rollbar';

import { resolvers as queryResolvers, Query } from './query';
import { resolvers as mutationResolvers, Mutation } from './mutation';
import { resolvers as caseResolvers } from './case';
import { resolvers as serviceResolvers } from './service';
import { resolvers as geocoderResolvers } from './geocoder';

import Open311 from '../services/Open311';
import ArcGIS from '../services/ArcGIS';
import Prediction from '../services/Prediction';
import Elasticsearch from '../services/Elasticsearch';

export interface Context {
  open311: Open311;
  arcgis: ArcGIS;
  prediction: Prediction;
  // "Required" Allows ElasticsearchFake to typecheck here even though its
  // private members don’t match.
  elasticsearch: Required<Elasticsearch>;
  rollbar: Rollbar;
}

/**
 * Absolute path to the root of our subpackage within the monorepo.
 */
const PACKAGE_SRC_ROOT: string = path.resolve(
  // We normalize between this file being run from the source directory and
  // being run from the build directory (which is one level deeper).
  __dirname.replace('/311/build/', '/311/'),
  '../../'
);

// This file is built by the "generate-graphql-schema" script from this
// directory’s interfaces.
const schemaGraphql = fs.readFileSync(
  path.resolve(PACKAGE_SRC_ROOT, 'graphql', 'schema.graphql'),
  'utf-8'
);

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
    ...caseResolvers,
    ...serviceResolvers,
    ...geocoderResolvers,
  } as any,

  allowUndefinedInResolve: false,
});
