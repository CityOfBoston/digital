// @flow

import type { Context } from '.';
import type { CreateServiceRequestArgs } from '../services/Open311';

export const Schema = `
input CreateRequestAttribute {
  code: String!
  value: String!
}

input LatLngIn {
  lat: Float!
  lng: Float!
}

type Mutation {
  createRequest (
    code: String!
    description: String!
    firstName: String
    lastName: String
    email: String
    phone: String
    address: String
    location: LatLngIn
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
  address: ?string,
  location: ?{
    lat: number,
    lng: number,
  },
  attributes: { code: string, value: string }[],
|};

export const resolvers = {
  Mutation: {
    createRequest: (root: mixed, args: CreateRequestArgs, { open311 }: Context) => {
      const createArgs: CreateServiceRequestArgs = {
        service_code: args.code,
        description: args.description,
        first_name: args.firstName,
        last_name: args.lastName,
        email: args.email,
        phone: args.phone,
        attributes: args.attributes,
      };

      if (args.address) {
        createArgs.address_string = args.address;
      }

      if (args.location) {
        createArgs.lat = args.location.lat;
        createArgs.long = args.location.lng;
      }

      return open311.createRequest(createArgs).then((arr) => arr[0]);
    },
  },
};
