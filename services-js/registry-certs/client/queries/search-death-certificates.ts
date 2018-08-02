import { gql } from '@cityofboston/next-client-common';
import { LoopbackGraphql } from '../lib/loopback-graphql';

import {
  SearchDeathCertificatesQuery,
  SearchDeathCertificatesQueryVariables,
} from './graphql-types';

import { DeathCertificateSearchResults } from '../types';

const QUERY = gql`
  query SearchDeathCertificates(
    $query: String!
    $page: Int!
    $startYear: String
    $endYear: String
  ) {
    deathCertificates {
      search(
        query: $query
        page: $page
        startYear: $startYear
        endYear: $endYear
      ) {
        page
        pageSize
        pageCount
        resultCount
        results {
          id
          firstName
          lastName
          deathYear
          deathDate
          pending
          age
          birthDate
        }
      }
    }
  }
`;

// Search for death certificates with a simple query
export default async function searchDeathCertificates(
  loopbackGraphql: LoopbackGraphql,
  query: string,
  page: number,
  startYear: string | null,
  endYear: string | null
): Promise<DeathCertificateSearchResults> {
  const queryVariables: SearchDeathCertificatesQueryVariables = {
    query,
    page,
    startYear,
    endYear,
  };
  const response: SearchDeathCertificatesQuery = await loopbackGraphql(
    QUERY,
    queryVariables
  );
  return response.deathCertificates.search;
}
