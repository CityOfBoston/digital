// @flow

export const Schema = `
type DeathCertificate {
  id: String!,
  firstName: String!,
  lastName: String!,
  birthYear: String!,
  deathYear: String!,
  causeOfDeath: String,
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
  birthYear: string,
  deathYear: string,
  causeOfDeath: ?string,
};

const TEST_DEATH_CERTIFICATES: DeathCertificate[] = [
  {
    id: '000001',
    firstName: 'Logan',
    lastName: 'Howlett',
    birthYear: '1974',
    deathYear: '2014',
    causeOfDeath: 'Adamantium suffocation',
  },
  {
    id: '000002',
    firstName: 'Bruce',
    lastName: 'Banner',
    birthYear: '1962',
    deathYear: '2016',
    causeOfDeath: 'Hawkeye',
  },
  {
    id: '000003',
    firstName: 'Monkey',
    lastName: 'Joe',
    birthYear: '1991',
    deathYear: '2005',
    causeOfDeath: null,
  },
];

export const resolvers = {
  DeathCertificates: {
    // eslint-disable-next-line no-unused-vars
    search: (root: mixed, { query }: SearchArgs) => TEST_DEATH_CERTIFICATES,
    certificate: (root: mixed, { id }: CertificateArgs) => TEST_DEATH_CERTIFICATES.find((c) => c.id === id),
    certificates: (root: mixed, { ids }: CertificatesArgs) => ids.map((id) => TEST_DEATH_CERTIFICATES.find((c) => c.id === id)),
  },
};
