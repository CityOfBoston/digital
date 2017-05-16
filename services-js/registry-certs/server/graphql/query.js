// @flow
/* eslint camelcase: 0 */

export const Schema = `
type Query {
  four: Int!
}
`;

export const resolvers = {
  Query: {
    four: () => 4,
  },
};
