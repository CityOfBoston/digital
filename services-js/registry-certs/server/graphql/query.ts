export const Schema = `
type Query {
  deathCertificates: DeathCertificates!
}
`;

export const resolvers = {
  Query: {
    deathCertificates: () => ({}),
  },
};
