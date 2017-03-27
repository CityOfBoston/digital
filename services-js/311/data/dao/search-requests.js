// @flow

import type { SearchRequestsPage } from '../types';
import type { LoopbackGraphql } from './loopback-graphql';

import type { SearchRequestsQuery, SearchRequestsQueryVariables } from './graphql/types';
import SearchRequestsGraphql from './graphql/SearchRequests.graphql';

// Searches requests by query and / or location.
export default async function searchRequests(loopbackGraphql: LoopbackGraphql, query: ?string = null): Promise<SearchRequestsPage> {
  const args: SearchRequestsQueryVariables = {
    query,
  };

  const response: SearchRequestsQuery = await loopbackGraphql(SearchRequestsGraphql, args);
  return response.requests;
}
