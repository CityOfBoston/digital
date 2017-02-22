// @flow

import type { Context } from '.';

export const Schema = `
input CreateRequestAttribute {
  code: String!
  value: String!
}

type Mutation {
  createRequest (
    code: String!
    description: String!
    firstName: String
    lastName: String
    email: String
    phone: String
    attributes: [CreateRequestAttribute!]!
  ): Request!
}
`;

type CreateRequestArgs = {|
  code: string,
  description: string,
  firstName: ?string,
  lastName: ?string,
  email: ?string,
  phone: ?string,
  attributes: { code: string, value: string }[],
|};

export const resolvers = {
  Mutation: {
    createRequest: (root: mixed, args: CreateRequestArgs, { open311 }: Context) => (
      open311.createRequest({
        service_code: args.code,
        service_description: args.description,
        requestor_first_name: args.firstName,
        requestor_last_name: args.lastName,
        requestor_email: args.email,
        requestor_phone: args.phone,
        attributes: args.attributes,
      }).then((arr) => arr[0])
    ),
  },
};
