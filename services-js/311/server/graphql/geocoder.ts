import { Context } from '.';
import { UnitResult } from '../services/ArcGIS';

export const Schema = `
type Geocoder {
  reverse(location: LatLngIn!): Place
  search(query: String!): [Place!]!
}

type Place {
  location: LatLng!
  address: String!
  addressId: String
  units: [Unit!]!
  exact: Boolean!
  alwaysUseLatLng: Boolean!
}

type Unit {
  location: LatLng!
  address: String!
  streetAddress: String!
  unit: String!
  addressId: String!
}
`;
export interface Root {}

interface LatLng {
  lat: number;
  lng: number;
}

interface ReverseGeocodeArgs {
  location: LatLng;
}

interface SearchArgs {
  query: string;
}

interface Place {
  location: LatLng;
  address: string;
  addressId: string | null;
  buildingId: string | null;
  exact: boolean;
  alwaysUseLatLng: boolean;
}

interface Unit {
  location: LatLng;
  address: string;
  streetAddress: string;
  unit: string;
  addressId: string | undefined;
}

export const resolvers = {
  Geocoder: {
    reverse: (
      _: Root,
      { location }: ReverseGeocodeArgs,
      { arcgis }: Context
    ): Promise<Place | null> =>
      arcgis.reverseGeocode(location.lat, location.lng),
    search: (
      _: Root,
      { query }: SearchArgs,
      { arcgis }: Context
    ): Promise<Place[]> => arcgis.search(query),
  },

  Place: {
    units: async (p: Place, _: {}, { arcgis }: Context): Promise<Unit[]> => {
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
