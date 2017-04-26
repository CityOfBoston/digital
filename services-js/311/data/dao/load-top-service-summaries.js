// @flow

import type { ServiceSummary } from '../types';
import type { LoopbackGraphql } from './loopback-graphql';

import type { LoadTopServiceSummariesQuery } from './graphql/types';
import LoadTopServiceSummariesGraphql from './graphql/LoadTopServiceSummaries.graphql';

// Loads a list of all ServiceSummary objects available in the Open311 endpoint.
export default async function loadTopServiceSummaries(loopbackGraphql: LoopbackGraphql): Promise<ServiceSummary[]> {
  const response: LoadTopServiceSummariesQuery = await loopbackGraphql(LoadTopServiceSummariesGraphql, null, { cacheKey: 'loadTopServiceSummaries' });
  return response.topServices;
}
