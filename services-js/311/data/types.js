// @flow

// Friendlier versions of the auto-created GraphQL types

import type {
//  LoadServiceQuery,
  LoadServiceQueryVariables,
  LoadServiceSummariesQuery,
  ServiceMetadataAttributeDatatype,
  SubmitRequestMutation,
} from './graphql/schema.flow';

export type ServiceSummary = $ArrayElement<$PropertyType<LoadServiceSummariesQuery, 'services'>>;

// HACK(finh): As of v0.40.0, Flow throws internal errors due to this use of
// $NonMaybeType, so we manually create the Service type. :(
// export type Service = $NonMaybeType<$PropertyType<LoadServiceQuery, 'service'>>;
export type Service = {
  name: string,
  code: string,
  hasMetadata: boolean,
  metadata: ? {
    attributes: Array<{
      required: boolean,
      type: ServiceMetadataAttributeDatatype,
      code: string,
      description: string,
      values: ?Array<{
        key: string,
        name: string,
      }>,
    }>,
  },
};

export type ServiceArgs = LoadServiceQueryVariables;
export type ServiceMetadata = $NonMaybeType<$PropertyType<Service, 'metadata'>>;
export type ServiceMetadataAttribute = $ArrayElement<$PropertyType<ServiceMetadata, 'attributes'>>;
export type SubmittedRequest = $PropertyType<SubmitRequestMutation, 'createRequest'>;
