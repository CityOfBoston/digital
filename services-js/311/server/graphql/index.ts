import { makeExecutableSchema } from 'graphql-tools';
import Rollbar from 'rollbar';

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
import { Open311 } from '../services/Open311';
import { ArcGIS } from '../services/ArcGIS';
import { Prediction } from '../services/Prediction';
import { Elasticsearch } from '../services/Elasticsearch';

export interface Context {
  open311: Open311;
  arcgis: ArcGIS;
  prediction: Prediction;
  elasticsearch: Elasticsearch;
  rollbar: Rollbar;
}

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
  } as any,

  allowUndefinedInResolve: false,
});
