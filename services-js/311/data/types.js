// @flow

// Friendlier versions of the auto-created GraphQL types

import type {
//  LoadServiceQuery,
  LoadServiceQueryVariables,
  LoadServiceSummariesQuery,
  LoadServiceQuery,
  SubmitRequestMutation,
} from './graphql/schema.flow';

export type ServiceSummary = $ArrayElement<$PropertyType<LoadServiceSummariesQuery, 'services'>>;
export type Service = $NonMaybeType<$PropertyType<LoadServiceQuery, 'service'>>;
export type ServiceArgs = LoadServiceQueryVariables;
export type ServiceMetadata = $NonMaybeType<$PropertyType<Service, 'metadata'>>;
export type ServiceMetadataAttribute = $ArrayElement<$PropertyType<ServiceMetadata, 'attributes'>>;
export type SubmittedRequest = $PropertyType<SubmitRequestMutation, 'createRequest'>;
