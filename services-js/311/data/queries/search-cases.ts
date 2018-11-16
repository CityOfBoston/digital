import { FetchGraphql, gql } from '@cityofboston/next-client-common';
import { SearchCasesVariables, SearchCases } from './types';

const QUERY = gql`
  query SearchCases(
    $query: String
    $topLeft: LatLngIn
    $bottomRight: LatLngIn
  ) {
    searchCases(query: $query, topLeft: $topLeft, bottomRight: $bottomRight) {
      query
      cases {
        id
        status
        description
        address
        images {
          squareThumbnailUrl
        }
        requestedAt
        requestedAtRelativeString
        location {
          lat
          lng
        }
        service {
          name
        }
      }
    }
  }
`;

// Searches cases by query and / or location.
export default async function searchCases(
  fetchGraphql: FetchGraphql,
  query: string | null,
  topLeft: { lat: number; lng: number } | null,
  bottomRight: { lat: number; lng: number } | null
) {
  const args: SearchCasesVariables = {
    query,
    topLeft,
    bottomRight,
  };

  const response: SearchCases = await fetchGraphql(QUERY, args);
  return response.searchCases;
}
