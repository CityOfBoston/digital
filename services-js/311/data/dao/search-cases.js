// @flow

import type { SearchCasesResult } from '../types';
import type { LoopbackGraphql } from './loopback-graphql';

import type {
  SearchCasesQuery,
  SearchCasesQueryVariables,
} from './graphql/types';
import SearchCasesGraphql from './graphql/SearchCases.graphql';

// Searches cases by query and / or location.
export default async function searchCases(
  loopbackGraphql: LoopbackGraphql,
  query: ?string = null,
  topLeft: ?{| lat: number, lng: number |},
  bottomRight: ?{| lat: number, lng: number |},
): Promise<SearchCasesResult> {
  const args: SearchCasesQueryVariables = {
    query,
    topLeft,
    bottomRight,
  };

  const response: SearchCasesQuery = await loopbackGraphql(
    SearchCasesGraphql,
    args,
  );
  return response.searchCases;
}
