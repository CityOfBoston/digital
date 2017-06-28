// @flow

import type { SearchAddressPlace } from '../types';
import type { LoopbackGraphql } from './loopback-graphql';

import type {
  ReverseGeocodeQuery,
  ReverseGeocodeQueryVariables,
} from './graphql/types';
import ReverseGeocodeGraphql from './graphql/ReverseGeocode.graphql';

// Takes a lat/lng and looks up the address for it from ArcGIS
export default async function reverseGeocode(
  loopbackGraphql: LoopbackGraphql,
  location: {| lat: number, lng: number |},
): Promise<?SearchAddressPlace> {
  const args: ReverseGeocodeQueryVariables = {
    location,
  };

  const response: ReverseGeocodeQuery = await loopbackGraphql(
    ReverseGeocodeGraphql,
    args,
  );
  return response.geocoder.reverse;
}
