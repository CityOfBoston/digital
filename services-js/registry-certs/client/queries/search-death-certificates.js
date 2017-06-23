// @flow

import type { LoopbackGraphql } from '../loopback-graphql';

import type {
  SearchDeathCertificatesQuery,
  SearchDeathCertificatesQueryVariables,
} from './graphql-types';
import SearchDeathCertificatesGraphql from './SearchDeathCertificates.graphql';

import type { DeathCertificateSearchResults } from '../types';

// Search for death certificates with a simple query
export default async function searchDeathCertificates(
  loopbackGraphql: LoopbackGraphql,
  query: string,
  page: number,
  startYear: ?string,
  endYear: ?string,
): Promise<DeathCertificateSearchResults> {
  const queryVariables: SearchDeathCertificatesQueryVariables = {
    query,
    page,
    startYear,
    endYear,
  };
  const response: SearchDeathCertificatesQuery = await loopbackGraphql(
    SearchDeathCertificatesGraphql,
    queryVariables,
  );
  return response.deathCertificates.search;
}
