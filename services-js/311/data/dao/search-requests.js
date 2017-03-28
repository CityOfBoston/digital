// @flow

import type { SearchRequestsPage } from '../types';
import type { LoopbackGraphql } from './loopback-graphql';

import type { SearchRequestsQuery, SearchRequestsQueryVariables } from './graphql/types';
import SearchRequestsGraphql from './graphql/SearchRequests.graphql';

// Searches requests by query and / or location.
export default async function searchRequests(
  loopbackGraphql: LoopbackGraphql,
  query: ?string = null,
  location: ?{lat: number, lng: number},
  radiusKm: ?number): Promise<SearchRequestsPage> {
  const args: SearchRequestsQueryVariables = {
    query,
    location,
    radiusKm,
  };

  const response: SearchRequestsQuery = await loopbackGraphql(SearchRequestsGraphql, args);
  return response.requests;
}
