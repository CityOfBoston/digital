// @flow

import { makeExecutableSchema } from 'graphql-tools';

import { Schema as QuerySchema, resolvers as queryResolvers } from './query';
import {
  Schema as MutationSchema,
  resolvers as mutationResolvers,
} from './mutation';
import {
  Schema as RequestSchema,
  resolvers as requestResolvers,
} from './request';
import {
  Schema as ServiceSchema,
  resolvers as serviceResolvers,
} from './service';
import {
  Schema as GeocoderSchema,
  resolvers as geocoderResolvers,
} from './geocoder';

import type Open311 from '../services/Open311';
import type ArcGIS from '../services/ArcGIS';
import type Prediction from '../services/Prediction';
import type SearchBox from '../services/SearchBox';

export type Context = {|
  open311: Open311,
  publicOpen311: Open311,
  arcgis: ArcGIS,
  prediction: Prediction,
  searchBox: SearchBox,
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
