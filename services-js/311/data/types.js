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

// TODO(finneganh): switch this back to load out of LoadServiceQuery once this is fixed:
// https://github.com/facebook/flow/issues/3147
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
