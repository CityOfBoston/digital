// @flow

import { makeExecutableSchema } from 'graphql-tools';

import { Schema as QuerySchema, resolvers as queryResolvers } from './query';
import {
  Schema as MutationSchema,
  resolvers as mutationResolvers,
} from './mutation';
import { Schema as CaseSchema, resolvers as caseResolvers } from './case';
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
import type Elasticsearch from '../services/Elasticsearch';

export type Context = {|
  open311: Open311,
  arcgis: ArcGIS,
  prediction: Prediction,
  elasticsearch: Elasticsearch,
  opbeat: any,
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
    CaseSchema,
    ServiceSchema,
    GeocoderSchema,
  ],
  resolvers: {
    ...queryResolvers,
    ...mutationResolvers,
    ...caseResolvers,
    ...serviceResolvers,
    ...geocoderResolvers,
  },
  allowUndefinedInResolve: false,
});
