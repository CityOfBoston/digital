import { FetchGraphql, gql } from '@cityofboston/next-client-common';
import { SearchAddress, SearchAddressVariables } from './types';

const QUERY = gql`
  query SearchAddress($query: String!) {
    geocoder {
      search(query: $query) {
        location {
          lat
          lng
        }
        address
        addressId
        exact
        alwaysUseLatLng
        units {
          address
          streetAddress
          unit
          addressId
        }
      }
    }
  }
`;

/**
 * Takes a partial address string and searches for it
 */
export default async function searchAddress(
  fetchGraphql: FetchGraphql,
  query: string
) {
  const args: SearchAddressVariables = { query };
  const response: SearchAddress = await fetchGraphql(QUERY, args);
  return response.geocoder.search;
}
