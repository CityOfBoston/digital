import { gql, FetchGraphql } from '@cityofboston/next-client-common';
import { LoadServiceSummaries } from './types';

const QUERY = gql`
  query LoadServiceSummaries {
    services {
      code
      name
      description
      group
    }
  }
`;

/**
 * Loads a list of all ServiceSummary objects available in the Open311 endpoint.
 */
export default async function loadServiceSummaries(fetchGraphql: FetchGraphql) {
  const response: LoadServiceSummaries = await fetchGraphql(QUERY);
  return response.services;
}
