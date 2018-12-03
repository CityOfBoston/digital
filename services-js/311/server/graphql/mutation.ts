import { Context } from '.';
import { CreateServiceRequestArgs } from '../services/Open311';
import { Root as Case } from './case';

export const Schema = `
input CreateCaseAttribute {
  code: String!
  value: String!
}

type Mutation {
  createCase (
    code: String!
    description: String!
    descriptionForClassifier: String!
    firstName: String
    lastName: String
    email: String
    phone: String
    address: String
    addressId: String
    mediaUrl: String
    location: LatLngIn
    attributes: [CreateCaseAttribute!]!
  ): Case!
}
`;

interface CreateCaseArgs {
  code: string;
  description: string;
  descriptionForClassifier: string;
  firstName: string | undefined;
  lastName: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  address: string | undefined;
  addressId: string | undefined;
  location:
    | {
        lat: number;
        lng: number;
      }
    | undefined;

  mediaUrl: string | undefined;
  attributes: { code: string; value: string }[];
}

export const resolvers = {
  Mutation: {
    async createCase(
      _: {},
      args: CreateCaseArgs,
      { open311, prediction, rollbar }: Context
    ): Promise<Case> {
      const createArgs: CreateServiceRequestArgs = {
        service_code: args.code,
        description: args.description,
        first_name: args.firstName,
        last_name: args.lastName,
        email: args.email,
        phone: args.phone,
        media_url: args.mediaUrl,
        attributes: args.attributes,
      };

      if (args.address) {
        createArgs.address_string = args.address;
      }

      // TODO(finh): Re-enable when
      // https://github.com/CityOfBoston/311/issues/599 is fixed
      //
      // if (args.addressId) {
      //   createArgs.address_id = args.addressId;
      // }

      if (args.location) {
        createArgs.lat = args.location.lat;
        createArgs.long = args.location.lng;
      }

      const c = await open311.createRequest(createArgs);

      // We send this asynchronously because its success or failure shouldn't
      // affect whether we return the new case to the client.
      if (args.descriptionForClassifier) {
        prediction
          .caseCreated(c, args.descriptionForClassifier)
          .catch(err => rollbar.error(err));
      }

      return c;
    },
  },
};
