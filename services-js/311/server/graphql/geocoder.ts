import { Resolvers, ResolvableWith } from '@cityofboston/graphql-typescript';

import { SearchResult } from '../services/ArcGIS';

import { Context } from '.';
import { LatLngIn, LatLng } from './query';

/**
 * A namespace for the reverse / search functions. Resolvable with "{}" because
 * there’s no actual "geocoder" state.
 */
export interface Geocoder extends ResolvableWith<{}> {
  reverse(args: { location: LatLngIn }): Place | null;
  search(args: { query: string }): Place[];
}

/**
 * Basically the same as SearchResult, plus a "units" field that gets resolved with
 */
interface Place extends ResolvableWith<SearchResult> {
  location: LatLng;
  address: string;
  addressId: string | null;
  exact: boolean;
  alwaysUseLatLng: boolean;

  units: Unit[];
}

/**
 * Implicitly resolvable with ArcGIS’s UnitResult.
 */
interface Unit {
  location: LatLng;
  address: string;
  streetAddress: string;
  unit: string;
  addressId: string;
}

const geocoderResolvers: Resolvers<Geocoder, Context> = {
  reverse: (_, { location }, { arcgis }) =>
    arcgis.reverseGeocode(location.lat, location.lng),
  search: (_, { query }, { arcgis }) => arcgis.search(query),
};

const placeResolvers: Resolvers<Place, Context> = {
  address: searchResult => searchResult.address,
  addressId: searchResult => searchResult.addressId,
  alwaysUseLatLng: searchResult => searchResult.alwaysUseLatLng,
  exact: searchResult => searchResult.exact,
  location: searchResult => searchResult.location,

  /**
   * Looking up units requires an extra call to ArcGIS, so we only do it if
   * units are actually requested.
   */
  units: async (searchResult, _, { arcgis }) =>
    searchResult.buildingId
      ? await arcgis.lookupUnits(searchResult.buildingId)
      : [],
};

export const resolvers = {
  Geocoder: geocoderResolvers,
  Place: placeResolvers,
};
