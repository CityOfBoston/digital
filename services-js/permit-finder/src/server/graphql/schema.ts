/**
 * @file This file defines the GraphQL schema and resolvers for our server.
 *
 * Run `npm run generate-graphql-schema` to use `ts2gql` to turn this file into
 * the `schema.graphql` file that can be consumed by this and other tools.
 *
 * The output is generated in the “graphql” directory in the package root so
 * that it can be `readFileSync`’d from both `build` (during dev and production)
 * and `src` (during test).
 */
import fs from 'fs';
import path from 'path';

import { makeExecutableSchema } from 'apollo-server-hapi';

import { Resolvers, ResolvableWith } from '@cityofboston/graphql-typescript';
import PermitFiles, {
  PermitMilestoneRow,
  PermitReviewRow,
  PermitDbEntry,
} from '../services/PermitFiles';
import { PACKAGE_ROOT } from '../util';

/** @graphql schema */
export interface Schema {
  query: Query;
}

enum PermitKind {
  BUILDING = 'BUILDING',
  FIRE = 'FIRE',
}

interface Query {
  permit(args: { permitNumber: string }): Permit | null;
}

interface Permit extends ResolvableWith<PermitDbEntry> {
  permitNumber: string;
  kind: PermitKind;
  type: string;
  address: string;
  city: string;
  state: string;
  zip: string;

  pointOfContactName: string;

  milestones: Milestone[];
  reviews: Review[];
}

interface Milestone extends ResolvableWith<PermitMilestoneRow> {
  milestoneName: string;

  cityContactName: string | null;

  /** YYYY-MM-DD */
  milestoneStartDate: string;
  /** YYYY-MM-DD */
  milestoneEndDate: string;

  averageDurationSecs: number;
}

interface Review extends ResolvableWith<PermitReviewRow> {
  isAssigned: boolean;
  isStarted: boolean;
  isComplete: boolean;

  status: string;
  type: string;

  reviewerName: string;
}

// This file is built by the "generate-graphql-schema" script from
// the above interfaces.
const schemaGraphql = fs.readFileSync(
  path.resolve(PACKAGE_ROOT, 'graphql', 'schema.graphql'),
  'utf-8'
);

export interface Context {
  permitFiles: PermitFiles;
}

export type QueryRootResolvers = Resolvers<Query, Context>;

const queryRootResolvers: QueryRootResolvers = {
  permit: (_, { permitNumber }, { permitFiles }) =>
    permitFiles.lookupPermit(permitNumber),
};

const permitResolvers: Resolvers<Permit, Context> = {
  address: ({ data: { Address } }) => {
    // The "Address" field also has city and often ZIP, so we pop off everything
    // past the last comma to keep it from showing redundantly.
    const bits = Address.split(',');
    if (bits.length > 1) {
      bits.pop();
    }
    return bits.join(',').trim();
  },
  city: ({ data: { City } }) => City,
  kind: ({ data: { BuildingOrFire } }) =>
    BuildingOrFire === 'Building' ? PermitKind.BUILDING : PermitKind.FIRE,
  permitNumber: ({ data: { PermitNumber } }) => PermitNumber,
  pointOfContactName: ({ data: { PermitPOCName } }) => PermitPOCName,
  state: ({ data: { State } }) => State,
  type: ({ data: { PermitType } }) => PermitType,
  zip: ({ data: { Zip } }) => Zip,

  milestones: ({ milestones }) => milestones,
  reviews: ({ reviews }) => reviews,
};

const milestoneResolvers: Resolvers<Milestone, Context> = {
  milestoneName: ({ MilestoneName }) => MilestoneName,

  cityContactName: ({ CityContactName }) => CityContactName || null,

  // These are in Eastern time, which is how we want to display them, so we can
  // just pull off the date part. Format: 2016-10-03 09:17:21.857000
  milestoneStartDate: ({ MilestoneStartDate }) =>
    MilestoneStartDate.split(' ')[0] || '',
  milestoneEndDate: ({ MilestoneEndDate }) =>
    MilestoneEndDate.split(' ')[0] || '',

  averageDurationSecs: ({ AverageDurationOfMilestone }) =>
    parseInt(AverageDurationOfMilestone, 10),
};

const reviewResolvers: Resolvers<Review, Context> = {
  type: ({ ReviewType }) => ReviewType,
  reviewerName: ({ ReviewerName }) => ReviewerName,
  status: ({ ReviewStatus }) => ReviewStatus,

  isAssigned: ({ IsAssignedFlag }) => IsAssignedFlag === 'Y',
  isStarted: ({ IsStartedFlag }) => IsStartedFlag === 'Y',
  isComplete: ({ IsCompleteFlag }) => IsCompleteFlag === 'Y',
};

export default makeExecutableSchema({
  typeDefs: [schemaGraphql],
  // We typecheck our own resolvers, so we set this as "any". Otherwise our
  // precise "args" typing conflicts with the general {[argument: string]: any}
  // type that the library gives them.
  resolvers: [
    {
      Query: queryRootResolvers,
      Permit: permitResolvers,
      Milestone: milestoneResolvers,
      Review: reviewResolvers,
    },
  ] as any,
  allowUndefinedInResolve: false,
});
