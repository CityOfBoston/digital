// @flow

export const Schema = `
type Request {
  id: String!
  code: String!
  description: String!
  firstName: String
  lastName: String
  email: String
  phone: String
}
`;

export const resolvers = {
  Request: {},
};
