import { Resolvers } from '@cityofboston/graphql-typescript';

import { CreateServiceRequestArgs } from '../services/Open311';

import { Context } from '.';
import { LatLngIn } from './query';
import { Case, CaseRoot } from './case';

/** @graphql input */
interface CreateCaseAttribute {
  code: string;
  value: string;
}

export interface Mutation {
  createCase(args: {
    code: string;
    description: string;
    descriptionForClassifier: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    addressId?: string;
    mediaUrl?: string;
    location?: LatLngIn;
    attributes: CreateCaseAttribute[];
  }): Case;
}

const mutationResolvers: Resolvers<Mutation, Context> = {
  async createCase(
    _,
    args,
    { open311, prediction, rollbar }
  ): Promise<CaseRoot> {
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

    if (args.location) {
      createArgs.lat = args.location.lat;
      createArgs.long = args.location.lng;
    }

    const request = await open311.createRequest(createArgs);

    // We send this asynchronously because its success or failure shouldn't
    // affect whether we return the new case to the client.
    if (args.descriptionForClassifier) {
      prediction
        .caseCreated(request, args.descriptionForClassifier)
        .catch(err => rollbar.error(err));
    }

    return {
      source: 'Open311',
      request,
    };
  },
};

export const resolvers = {
  Mutation: mutationResolvers,
};
