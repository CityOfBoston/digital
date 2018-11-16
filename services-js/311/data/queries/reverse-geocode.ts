import { gql, FetchGraphql } from '@cityofboston/next-client-common';
import { ReverseGeocode, ReverseGeocodeVariables } from './types';

const QUERY = gql`
  query ReverseGeocode($location: LatLngIn!) {
    geocoder {
      reverse(location: $location) {
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
 * Takes a lat/lng and looks up the address for it from ArcGIS
 */
export default async function reverseGeocode(
  fetchGraphql: FetchGraphql,
  location: { lat: number; lng: number }
) {
  const args: ReverseGeocodeVariables = {
    location,
  };
  const response: ReverseGeocode = await fetchGraphql(QUERY, args);
  return response.geocoder.reverse;
}
