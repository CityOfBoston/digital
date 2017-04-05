// @flow

import type { Context } from '.';

export const Schema = `
type Geocoder {
  reverse(location: LatLngIn!): Place
  search(query: String!): Place
}

type Place {
  location: LatLng!
  address: String!
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
};

export const resolvers = {
  Geocoder: {
    reverse: async (s: Root, { location }: ReverseGeocodeArgs, { arcgis }: Context): Promise<?Place> => {
      const address = await arcgis.reverseGeocode(location.lat, location.lng);
      if (address) {
        return { location, address };
      } else {
        return null;
      }
    },
    search: async (s: Root, { query }: SearchArgs, { arcgis }: Context): Promise<?Place> => arcgis.search(query),
  },
};
