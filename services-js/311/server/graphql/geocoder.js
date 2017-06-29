// @flow

import type { Context } from '.';
import type { UnitResult } from '../services/ArcGIS';

export const Schema = `
type Geocoder {
  reverse(location: LatLngIn!): Place
  search(query: String!): Place
}

type Place {
  location: LatLng!
  address: String!
  addressId: String
  units: [Unit!]!
  exact: Boolean!
}

type Unit {
  location: LatLng!
  address: String!
  streetAddress: String!
  unit: String!
  addressId: String!
}
`;

export type Root = {};

type LatLng = {
  lat: number,
  lng: number,
};

type ReverseGeocodeArgs = {
  location: LatLng,
};

type SearchArgs = {
  query: string,
};

type Place = {
  location: LatLng,
  address: string,
  addressId: ?string,
  buildingId: ?string,
  exact: boolean,
};

type Unit = {
  location: LatLng,
  address: string,
  streetAddress: string,
  unit: string,
  addressId: ?string,
};

export const resolvers = {
  Geocoder: {
    reverse: (
      s: Root,
      { location }: ReverseGeocodeArgs,
      { arcgis }: Context
    ): Promise<?Place> => arcgis.reverseGeocode(location.lat, location.lng),
    search: (
      s: Root,
      { query }: SearchArgs,
      { arcgis }: Context
    ): Promise<?Place> => arcgis.search(query),
  },

  Place: {
    units: async (
      p: Place,
      args: mixed,
      { arcgis }: Context
    ): Promise<Array<Unit>> => {
      const units: UnitResult[] = p.buildingId
        ? await arcgis.lookupUnits(p.buildingId)
        : [];
      return units.map(
        ({
          address,
          location,
          unit,
          streetAddress,
          addressId,
        }: UnitResult) => ({
          address,
          location,
          unit,
          addressId,
          streetAddress,
        })
      );
    },
  },
};
