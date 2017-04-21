// @flow

import type { ServiceSummary } from '../types';
import type { LoopbackGraphql } from './loopback-graphql';

import type { LoadServiceSummariesQuery } from './graphql/types';
import LoadServiceSummariesGraphql from './graphql/LoadServiceSummaries.graphql';

// Loads a list of all ServiceSummary objects available in the Open311 endpoint.
export default async function loadServiceSummaries(loopbackGraphql: LoopbackGraphql): Promise<ServiceSummary[]> {
  const response: LoadServiceSummariesQuery = await loopbackGraphql(LoadServiceSummariesGraphql);
  return response.services;
}
