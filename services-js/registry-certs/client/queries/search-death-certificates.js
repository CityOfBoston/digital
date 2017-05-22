// @flow

import type { DeathCertificate } from '../types';
import type { LoopbackGraphql } from '../loopback-graphql';

import type { SearchDeathCertificatesQuery, SearchDeathCertificatesQueryVariables } from './graphql-types';
import SearchDeathCertificatesGraphql from './SearchDeathCertificates.graphql';

// Search for death certificates with a simple query
export default async function searchDeathCertificates(loopbackGraphql: LoopbackGraphql, query: string): Promise<DeathCertificate[]> {
  const queryVariables: SearchDeathCertificatesQueryVariables = { query };
  const response: SearchDeathCertificatesQuery = await loopbackGraphql(SearchDeathCertificatesGraphql, queryVariables);
  return response.deathCertificates.search;
}
