// @flow

import type { Context } from './index';
import type { SearchResult } from '../services/Registry';

export const Schema = `
type DeathCertificate {
  id: String!,
  firstName: String!,
  lastName: String!,
  birthYear: String,
  deathDate: String!,
  causeOfDeath: String,
  age: String,
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
  search(query: String!, page: Int, pageSize: Int): DeathCertificateSearch!
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
  birthYear: ?string,
  deathDate: string,
  causeOfDeath: ?string,
  age: ?string,
};

type DeathCertificateSearch = {
  page: number,
  pageSize: number,
  pageCount: number,
  results: DeathCertificate[],
  resultCount: number,
}

const TEST_DEATH_CERTIFICATES: DeathCertificate[] = [
  {
    id: '000001',
    firstName: 'Logan',
    lastName: 'Howlett',
    birthYear: '1974',
    deathDate: '2014',
    causeOfDeath: 'Adamantium suffocation',
    age: '058',
  },
  {
    id: '000002',
    firstName: 'Bruce',
    lastName: 'Banner',
    birthYear: '1962',
    deathDate: '2016',
    causeOfDeath: 'Hawkeye',
    age: '61',
  },
  {
    id: '000003',
    firstName: 'Monkey',
    lastName: 'Joe',
    birthYear: '1991',
    deathDate: '2005',
    causeOfDeath: null,
    age: '4 yrs. 2 mos. 10 dys',
  },
];

export const resolvers = {
  DeathCertificates: {
    // eslint-disable-next-line no-unused-vars
    search: async (root: mixed, { query, pageSize, page }: SearchArgs, { registry }: Context): Promise<DeathCertificateSearch> => {
      const queryPageSize = Math.min(pageSize || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
      const queryPage = (page || 1) - 1;

      const results: Array<SearchResult> = await registry.search(query, queryPage, queryPageSize);

      const resultCount = results.length > 0 ? results[0].ResultCount : 0;
      const pageCount = Math.ceil(resultCount / queryPageSize);

      return {
        page: queryPage + 1,
        pageSize: queryPageSize,
        pageCount,
        resultCount,
        results: results.map((res) => ({
          id: res.CertificateID.toString(),
          firstName: res['First Name'],
          lastName: res['Last Name'],
          birthYear: null,
          deathDate: res['Date of Death'],
          causeOfDeath: null,
          age: res.AgeOrDateOfBirth.replace(/^0+/, '') || '0',
        })),
      };
    },
    certificate: (root: mixed, { id }: CertificateArgs) => TEST_DEATH_CERTIFICATES.find((c) => c.id === id),
    certificates: (root: mixed, { ids }: CertificatesArgs) => ids.map((id) => TEST_DEATH_CERTIFICATES.find((c) => c.id === id)),
  },
};
