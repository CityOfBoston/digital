import {
  Resolvers,
  ResolvableWith,
  Int,
} from '@cityofboston/graphql-typescript';

import { Context } from './index';

export interface BirthCertificateSearch {
  /**
   * The only information we want to reveal for a search is how many
   * non-restricted records it matched. That way we don’t leak more info than
   * the user supplied in their search.
   */
  count: Int;
}

export interface BirthCertificates extends ResolvableWith<{}> {
  search(args: {
    firstName: string;
    lastName: string;
    dob: Date;
    parent1FirstName: string;
    parent2FirstName?: string;
  }): BirthCertificateSearch;
}

const birthCertificatesResolvers: Resolvers<BirthCertificates, Context> = {
  search: async (
    _root,
    { firstName, lastName, dob, parent1FirstName, parent2FirstName },
    { registryDb }
  ) => {
    return {
      count: (await registryDb.searchBirthCertificates(
        firstName,
        lastName,
        dob,
        parent1FirstName,
        parent2FirstName || null
      )).length,
    };
  },
};

export const resolvers = {
  BirthCertificates: birthCertificatesResolvers,
};
