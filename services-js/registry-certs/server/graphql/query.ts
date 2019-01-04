import { Resolvers, ResolvableWith } from '@cityofboston/graphql-typescript';
import { DeathCertificates } from './death-certificates';
import { Context } from '.';

export interface Query extends ResolvableWith<{}> {
  deathCertificates: DeathCertificates;
}

const queryResolvers: Resolvers<Query, Context> = {
  deathCertificates: () => ({}),
};

export const resolvers = {
  Query: queryResolvers,
};
