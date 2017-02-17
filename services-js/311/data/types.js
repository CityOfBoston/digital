// @flow

// Friendlier versions of the auto-created GraphQL types

import type {
  LoadServiceQuery,
  LoadServiceQueryVariables,
  LoadServiceSummariesQuery,
} from './graphql/schema.flow';

export type ServiceSummary = $ArrayElement<$PropertyType<LoadServiceSummariesQuery, 'services'>>;
export type Service = $NonMaybeType<$PropertyType<LoadServiceQuery, 'service'>>;
export type ServiceArgs = LoadServiceQueryVariables;
