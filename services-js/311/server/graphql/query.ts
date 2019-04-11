import {
  Int,
  Resolvers,
  ResolvableWith,
} from '@cityofboston/graphql-typescript';

import { Context } from '.';
import { Case, CaseRoot } from './case';
import { Geocoder } from './geocoder';
import { Service, ServiceRoot } from './service';

export interface Query {
  services: Service[];

  topServices(args: { first: Int }): Service[];

  servicesForDescription(args: {
    text: string;
    max?: Int;
    threshold?: number;
  }): Service[];

  service(args: { code: string }): Service | null;

  case(args: { id: string }): Case | null;

  searchCases(args: {
    query?: string;
    topLeft?: LatLngIn;
    bottomRight?: LatLngIn;
  }): CaseSearchResults;

  geocoder: Geocoder;
}

/** @graphql input */
export interface LatLngIn {
  lat: number;
  lng: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

interface CaseSearchResults extends ResolvableWith<CaseSearchResultsRoot> {
  cases: Case[];
  query: string;
}

// Slight hack because the "ResolvableWith" handling doesn’t reach inside of
// objects, so we can't return { cases: IndexedCase[], … } for CaseSearchResults
// and have the types know that IndexedCase matches Case’s ResolvableWith.
interface CaseSearchResultsRoot {
  cases: CaseRoot[];
  query: string;
}

// HACK(finh): We need a way to invalidate this cache.
let cachedTopServices: Promise<ServiceRoot[]> | null = null;

// Top 10 non-seasonal requests as of 9/18/17
const TOP_SERVICE_CODES = [
  'PRKGENFORC',
  'STRCLEAN',
  'SCHDBLKITM',
  'REQPOTHL',
  'MTRECYDBI',
  'IMPSTRTRSH',
  'STRLGTOUT',
  'MISDMGSGN',
  'TFCSGNINSP',
  'SDWRPR',
];

async function serviceSuggestions(
  { open311, prediction }: Context,
  text: string,
  max: number = 5
): Promise<ServiceRoot[]> {
  const [suggestions, services] = await Promise.all([
    prediction.caseTypes(text),
    open311.services(),
  ]);

  const matchedServices: ServiceRoot[] = [];
  suggestions.forEach(type => {
    const matchedService = services.find(
      ({ service_code }) => service_code === type
    );

    if (matchedService) {
      matchedServices.push(matchedService);
    }
  });

  return matchedServices.slice(0, max);
}

const queryResolvers: Resolvers<Query, Context> = {
  services: (_root, _args, { open311 }) => open311.services(),

  topServices: async (_root, { first }, { open311 }) => {
    if (!cachedTopServices) {
      cachedTopServices = open311.services().catch(err => {
        cachedTopServices = null;
        throw err;
      });
    }

    return (await cachedTopServices)
      .filter(
        ({ service_code }) => TOP_SERVICE_CODES.indexOf(service_code) !== -1
      )
      .slice(0, first || TOP_SERVICE_CODES.length);
  },

  servicesForDescription: (_root, { text, max }, context) =>
    serviceSuggestions(context, text, max),

  service: (_root, { code }, { open311 }) => open311.service(code),

  // We put an explicit type on the return value here so that "source" stays as
  // the union of type literals, rather than being interpreted as just a string
  // type.
  case: async (_root, { id }, { open311 }): Promise<CaseRoot | null> => {
    const request = await open311.request(id);
    return request && { source: 'Open311', request };
  },

  searchCases: async (
    _root,
    { query, topLeft, bottomRight },
    { elasticsearch }
  ) => {
    const cases = (await elasticsearch.searchCases(
      query,
      topLeft,
      bottomRight
    )).map((request): CaseRoot => ({ source: 'Elasticsearch', request }));

    return {
      cases,
      query: query || '',
    };
  },

  geocoder: () => ({}),
};

export const resolvers = {
  Query: queryResolvers,
};
