// @flow

import type { Context } from './index';
import type { SearchResult } from '../services/Registry';

export const Schema = `
type DeathCertificate {
  id: String!,
  firstName: String!,
  lastName: String!,
  birthYear: String,
  deathYear: String!,
  causeOfDeath: String,
  age: String,
}

type DeathCertificates {
  search(query: String!): [DeathCertificate!]!
  certificate(id: String!): DeathCertificate
  certificates(ids: [String!]!): [DeathCertificate]!
}
`;

type SearchArgs = {
  query: string,
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
  deathYear: string,
  causeOfDeath: ?string,
  age: ?string,
};

const TEST_DEATH_CERTIFICATES: DeathCertificate[] = [
  {
    id: '000001',
    firstName: 'Logan',
    lastName: 'Howlett',
    birthYear: '1974',
    deathYear: '2014',
    causeOfDeath: 'Adamantium suffocation',
    age: '058',
  },
  {
    id: '000002',
    firstName: 'Bruce',
    lastName: 'Banner',
    birthYear: '1962',
    deathYear: '2016',
    causeOfDeath: 'Hawkeye',
    age: '61',
  },
  {
    id: '000003',
    firstName: 'Monkey',
    lastName: 'Joe',
    birthYear: '1991',
    deathYear: '2005',
    causeOfDeath: null,
    age: '4 yrs. 2 mos. 10 dys',
  },
];

export const resolvers = {
  DeathCertificates: {
    // eslint-disable-next-line no-unused-vars
    search: async (root: mixed, { query }: SearchArgs, { registry }: Context): Promise<Array<DeathCertificate>> => {
      const results: Array<SearchResult> = await registry.search(query);

      return results.map((res) => ({
        id: res.CertificateID.toString(),
        firstName: res['First Name'],
        lastName: res['Last Name'],
        birthYear: null,
        deathYear: res['Date of Death'].split('/')[2],
        causeOfDeath: null,
        age: res.AgeOrDateOfBirth,
      }));
    },
    certificate: (root: mixed, { id }: CertificateArgs) => TEST_DEATH_CERTIFICATES.find((c) => c.id === id),
    certificates: (root: mixed, { ids }: CertificatesArgs) => ids.map((id) => TEST_DEATH_CERTIFICATES.find((c) => c.id === id)),
  },
};
