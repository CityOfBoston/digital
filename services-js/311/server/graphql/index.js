// @flow

import { makeExecutableSchema } from 'graphql-tools';

import { Schema as QuerySchema, resolvers as queryResolvers } from './query';
import { Schema as MutationSchema, resolvers as mutationResolvers } from './mutation';
import { Schema as RequestSchema, resolvers as requestResolvers } from './request';
import { Schema as ServiceSchema, resolvers as serviceResolvers } from './service';
import { Schema as GeocoderSchema, resolvers as geocoderResolvers } from './geocoder';

import type Open311 from '../services/Open311';
import type Swiftype from '../services/Swiftype';
import type ArcGIS from '../services/ArcGIS';

export type Context = {|
  open311: Open311,
  swiftype: Swiftype,
  arcgis: ArcGIS,
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
    GeocoderSchema,
  ],
  resolvers: {
    ...queryResolvers,
    ...mutationResolvers,
    ...requestResolvers,
    ...serviceResolvers,
    ...geocoderResolvers,
  },
  allowUndefinedInResolve: false,
});
