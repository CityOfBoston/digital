/* eslint camelcase: 0 */
import { Context } from '.';
import { Service } from '../services/Open311';
import { IndexedCase } from '../services/Elasticsearch';
import { Root as CaseRoot } from './case';

export const Schema = `
type LatLng {
  lat: Float!
  lng: Float!
}

input LatLngIn {
  lat: Float!
  lng: Float!
}

type CaseSearchResults {
  cases: [Case!]!
  query: String!
}

type Query {
  services: [Service!]!
  topServices(first: Int): [Service!]!
  servicesForDescription(text: String!, max: Int, threshold: Float): [Service!]!
  service(code: String!): Service
  case(id: String!): Case
  searchCases(query: String, topLeft: LatLngIn, bottomRight: LatLngIn): CaseSearchResults!
  geocoder: Geocoder!
}
`;

interface SuggestionsArgs {
  text: string;
  max: number | undefined;
  threshold: number | undefined;
}

interface SearchCasesArgs {
  query: string | undefined;
  topLeft:
    | {
        lat: number;
        lng: number;
      }
    | undefined;

  bottomRight:
    | {
        lat: number;
        lng: number;
      }
    | undefined;
}

interface CaseSearchResults {
  cases: IndexedCase[];
  query: string;
}

// HACK(finh): We need a way to invalidate this cache.
let cachedTopServices: Promise<Service[]> | null = null;

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
  { text, max }: SuggestionsArgs
): Promise<Service[]> {
  const [suggestions, services] = await Promise.all([
    prediction.caseTypes(text),
    open311.services(),
  ]);

  const matchedServices: Service[] = [];
  suggestions.forEach(type => {
    const matchedService = services.find(
      ({ service_code }) => service_code === type
    );

    if (matchedService) {
      matchedServices.push(matchedService);
    }
  });

  return matchedServices.slice(0, max || 5);
}

export const resolvers = {
  Query: {
    services: (
      _root: {},
      _args: {},
      { open311 }: Context
    ): Promise<Service[]> => open311.services(),

    topServices: async (
      _root: {},
      { first }: { first: number | undefined },
      { open311 }: Context
    ): Promise<Service[]> => {
      if (!cachedTopServices) {
        cachedTopServices = open311.services().catch(err => {
          cachedTopServices = null;
          throw err;
        });
      }
      return cachedTopServices.then(services =>
        services
          .filter(
            ({ service_code }) => TOP_SERVICE_CODES.indexOf(service_code) !== -1
          )
          .slice(0, first || TOP_SERVICE_CODES.length)
      );
    },

    servicesForDescription: (
      _root: {},
      args: SuggestionsArgs,
      context: Context
    ): Promise<Service[]> => serviceSuggestions(context, args),

    service: (
      _root: {},
      { code }: { code: string },
      { open311 }: Context
    ): Promise<Service | null> => open311.service(code),

    case: (
      _root: {},
      { id }: { id: string },
      { open311 }: Context
    ): Promise<CaseRoot | null> => open311.request(id),

    searchCases: async (
      _root: {},
      { query, topLeft, bottomRight }: SearchCasesArgs,
      { elasticsearch }: Context
    ): Promise<CaseSearchResults> => {
      const cases = await elasticsearch.searchCases(
        query,
        topLeft,
        bottomRight
      );

      return {
        cases,
        query: query || '',
      };
    },
    geocoder: () => ({}),
  },
};
