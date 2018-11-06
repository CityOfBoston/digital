import { Resolvers, ResolvableWith } from '@cityofboston/graphql-typescript';
import { DeathCertificates } from './death-certificates';
import { BirthCertificates } from './birth-certificates';
import { Context } from '.';

export interface Query extends ResolvableWith<{}> {
  deathCertificates: DeathCertificates;
  birthCertificates: BirthCertificates;
}

const queryResolvers: Resolvers<Query, Context> = {
  deathCertificates: () => ({}),
  birthCertificates: () => ({}),
};

export const resolvers = {
  Query: queryResolvers,
};
