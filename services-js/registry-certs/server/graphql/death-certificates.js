// @flow

import moment from 'moment';
import type { Context } from './index';
import type {
  DeathCertificateSearchResult,
  DeathCertificate as DbDeathCertificate,
} from '../services/Registry';

export const Schema = `
type DeathCertificate {
  id: String!,
  firstName: String!,
  lastName: String!,
  deathDate: String,
  deathYear: String!,
  pending: Boolean,
  age: String,
  birthDate: String,
}

# Pages are 1-indexed to make the UI look better
type DeathCertificateSearch {
  page: Int!,
  pageSize: Int!,
  pageCount: Int!,
  results: [DeathCertificate!]!,
  resultCount: Int!,
}

type DeathCertificates {
  search(query: String!, page: Int, pageSize: Int, startYear: String, endYear: String): DeathCertificateSearch!
  certificate(id: String!): DeathCertificate
  certificates(ids: [String!]!): [DeathCertificate]!
}
`;

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 500;

type SearchArgs = {
  query: string,
  page?: number,
  pageSize?: number,
  startYear?: string,
  endYear?: string,
};

type CertificateArgs = {
  id: string,
};

type CertificatesArgs = {
  ids: string[],
};

type DeathCertificate = {
  id: string,
  firstName: string,
  lastName: string,
  deathDate: ?string,
  deathYear: string,
  pending: boolean,
  age: ?string,
};

type DeathCertificateSearch = {
  page: number,
  pageSize: number,
  pageCount: number,
  results: DeathCertificate[],
  resultCount: number,
};

const DATE_REGEXP = /\(?\s*(\d\d?\/\d\d?\/\d\d\d\d)\s*\)?/;

export function parseAgeOrDateOfBirth(
  str: ?string
): { age: ?string, birthDate: ?string } {
  const dateMatch = (str || '').match(DATE_REGEXP);

  let age = (str || '')
    .replace(/^0+/, '')
    .replace(DATE_REGEXP, '')
    .trim();

  if (dateMatch && !age) {
    age = moment().diff(moment(dateMatch[1], 'MM/DD/YYYY'), 'years');
  }

  return {
    age: age ? `${age}` : null,
    birthDate: dateMatch ? dateMatch[1] : null,
  };
}

function searchResultToDeathCertificate(
  res: DeathCertificateSearchResult | DbDeathCertificate
): DeathCertificate {
  const { age, birthDate } = parseAgeOrDateOfBirth(res.AgeOrDateOfBirth);

  return {
    id: res.CertificateID.toString(),
    firstName: res['First Name'],
    lastName: res['Last Name'],
    deathDate: res['Date of Death'],
    deathYear: res.RegisteredYear,
    pending: !!res.Pending,
    age,
    birthDate,
  };
}

export const resolvers = {
  DeathCertificates: {
    search: async (
      root: mixed,
      { query, pageSize, page, startYear, endYear }: SearchArgs,
      { registry }: Context
    ): Promise<DeathCertificateSearch> => {
      const queryPageSize = Math.min(
        pageSize || DEFAULT_PAGE_SIZE,
        MAX_PAGE_SIZE
      );
      const queryPage = (page || 1) - 1;

      const results: Array<
        DeathCertificateSearchResult
      > = await registry.search(
        query,
        queryPage,
        queryPageSize,
        startYear,
        endYear
      );

      const resultCount = results.length > 0 ? results[0].ResultCount : 0;
      const pageCount = Math.ceil(resultCount / queryPageSize);

      return {
        page: queryPage + 1,
        pageSize: queryPageSize,
        pageCount,
        resultCount,
        results: results.map(searchResultToDeathCertificate),
      };
    },
    certificate: async (
      root: mixed,
      { id }: CertificateArgs,
      { registry }: Context
    ): Promise<?DeathCertificate> => {
      const res = await registry.lookup(id);

      if (res) {
        return searchResultToDeathCertificate(res);
      } else {
        return null;
      }
    },
    certificates: (
      root: mixed,
      { ids }: CertificatesArgs,
      { registry }: Context
    ): Promise<Array<?DeathCertificate>> =>
      Promise.all(
        ids.map(async (id): Promise<?DeathCertificate> => {
          const res = await registry.lookup(id);
          if (res) {
            return searchResultToDeathCertificate(res);
          } else {
            return null;
          }
        })
      ),
  },
};
