// @flow

// Friendlier versions of the auto-created GraphQL types

import type {
  LoadServiceQuery,
  LoadServiceQueryVariables,
  SubmitRequestMutation,
} from './graphql/schema.flow';

import type { State as RequestState } from './store/request';

export type Request = RequestState;

// HACK(finh): As of v0.41.0, Flow throws internal errors due something in
// here, so we have to manually create this type. :(
// export type ServiceSummary = $ArrayElement<$PropertyType<LoadServiceSummariesQuery, 'services'>>;
export type ServiceSummary = {
  code: string,
  name: string,
  hasMetadata: boolean,
  locationRequired: boolean,
}

export type Service = $NonMaybeType<$PropertyType<LoadServiceQuery, 'service'>>;
// HACK(finh): The above type has been flaky in Flow as recent as 0.40. Here's
// the definition in case it needs to be used instead.
// export type Service = {
//   name: string,
//   code: string,
//   hasMetadata: boolean,
//   metadata: ? {
//     attributes: Array<{
//       required: boolean,
//       type: ServiceMetadataAttributeDatatype,
//       code: string,
//       description: string,
//       values: ?Array<{
//         key: string,
//         name: string,
//       }>,
//     }>,
//   },
// };

export type ServiceArgs = LoadServiceQueryVariables;
export type ServiceMetadata = $NonMaybeType<$PropertyType<Service, 'metadata'>>;
export type ServiceMetadataAttribute = $ArrayElement<$PropertyType<ServiceMetadata, 'attributes'>>;
export type SubmittedRequest = $PropertyType<SubmitRequestMutation, 'createRequest'>;
