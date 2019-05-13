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

import CommissionsDao, {
  DbBoard,
  DbDepartment,
  DbMember,
  DbPolicyType,
} from '../dao/CommissionsDao';

/** @graphql schema */
export interface Schema {
  query: Query;
}

export interface Query {
  commissions(args: {
    policyTypeIds: number[] | undefined;
    query: string | undefined;
    hasOpenSeats: boolean | undefined;
  }): Commission[];
  commission(args: { id: number }): Commission | null;

  policyTypes: PolicyType[];
}

export interface PolicyType extends ResolvableWith<DbPolicyType> {
  id: number;
  name: string;
}

export interface Commission extends ResolvableWith<DbBoard> {
  id: number;
  name: string;
  homepageUrl: string | null;
  policyType: PolicyType | null;
  department: Department | null;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  authority: string | null;
  term: string | null;
  stipend: number;
  seats: number;
  enablingLegislation: string | null;
  members: Member[];
  /**
   * Number of seats that are either vacant or occupied by a holdover whose
   * term is up.
   */
  openSeats: number;
  applyUrl: string;
}

export interface Department extends ResolvableWith<DbDepartment> {
  name: string;
  homepageUrl: string | null;
}

export interface Member extends ResolvableWith<DbMember> {
  name: string;
  appointed: Date | null;
  expires: Date | null;
  status: string;
  holdover: boolean;
}

// This file is built by the "generate-graphql-schema" script from
// the above interfaces.
const schemaGraphql = fs.readFileSync(
  path.resolve(__dirname, '..', '..', '..', 'graphql', 'schema.graphql'),
  'utf-8'
);

export interface Context {
  commissionsDao: CommissionsDao;
}

const caseInsensitiveSearch = (
  query: string,
  text: string | null | undefined
) => text && text.toLocaleLowerCase().includes(query.toLocaleLowerCase());

const queryRootResolvers: Resolvers<Query, Context> = {
  commissions: async (
    _obj,
    { policyTypeIds, query, hasOpenSeats },
    { commissionsDao }
  ) => {
    let commissions = await commissionsDao.fetchBoards();

    // typeof checks because all of the args are optional

    if (Array.isArray(policyTypeIds)) {
      commissions = commissions.filter(
        ({ PolicyTypeId }) =>
          typeof PolicyTypeId === 'number' &&
          policyTypeIds.includes(PolicyTypeId)
      );
    }

    if (typeof query === 'string' && query) {
      commissions = commissions.filter(
        ({ BoardName, Description }) =>
          caseInsensitiveSearch(query, BoardName) ||
          caseInsensitiveSearch(query, Description)
      );
    }

    if (typeof hasOpenSeats === 'boolean') {
      commissions = commissions.filter(
        ({ ActiveCount, Seats }) => (ActiveCount || 0) < Seats === hasOpenSeats
      );
    }

    return commissions;
  },
  commission: (_obj, { id }, { commissionsDao }) =>
    commissionsDao.fetchBoard(id),
  policyTypes: (_obj, _args, { commissionsDao }) =>
    commissionsDao.fetchPolicyTypes(),
};

export const commissionResolvers: Resolvers<Commission, Context> = {
  id: ({ BoardID }) => BoardID,
  name: ({ BoardName }) => BoardName || 'Unknown Board',
  homepageUrl: ({ LinkPath }) => LinkPath,
  description: ({ Description }) => Description || '',
  department: async ({ DepartmentId }, _args, { commissionsDao }) =>
    DepartmentId ? await commissionsDao.fetchDepartment(DepartmentId) : null,
  policyType: async ({ PolicyTypeId }, _args, { commissionsDao }) =>
    PolicyTypeId ? await commissionsDao.fetchPolicyType(PolicyTypeId) : null,
  contactName: ({ Contact }) => Contact || '',
  contactEmail: ({ Email }) => Email || '',
  contactPhone: ({ Phone }) => Phone || '',
  authority: async ({ AuthorityId }, _args, { commissionsDao }) => {
    if (AuthorityId == null) {
      return null;
    }

    const authority = await commissionsDao.fetchAuthority(AuthorityId);

    if (!authority) {
      return null;
    }

    if (!authority.AuthorityType) {
      return null;
    }

    if (authority.AuthorityType.toLocaleLowerCase() === 'not applicable') {
      return null;
    }

    return authority.AuthorityType;
  },
  term: ({ Term }) => Term,
  stipend: ({ Stipend }) => Stipend,
  seats: ({ Seats }) => Seats,
  enablingLegislation: ({ Legislation }) => Legislation,
  // Currently some boards have "0" for the number of seats, so the open seat
  // calculation ends up negative. `max 0` keeps us from looking silly.
  openSeats: ({ ActiveCount, Seats }) =>
    Math.max(0, Seats - (ActiveCount || 0)),
  // TODO(finh): Remove the cityofboston.gov URL when we're stable in
  // production.
  applyUrl: ({ BoardName, BoardID }) =>
    process.env.APPLY_URL
      ? `${process.env.APPLY_URL}?commissionID=${BoardID}`
      : `https://www.cityofboston.gov/boardsandcommissions/application/apply.aspx?bid=${encodeURIComponent(
          BoardName!
        )}`,
  members: async ({ BoardID }, _args, { commissionsDao }) =>
    // Some commissions have employees listed, which we want to remove.
    (await commissionsDao.fetchBoardMembers(BoardID)).filter(
      ({ StatusName }) => StatusName !== 'employee'
    ),
};

const departmentResolvers: Resolvers<Department, Context> = {
  name: ({ DepartmentName }) => DepartmentName || 'Unknown Department',
  homepageUrl: ({ LinkPath }) => LinkPath,
};

const policyTypeResolvers: Resolvers<PolicyType, Context> = {
  id: ({ PolicyTypeId }) => PolicyTypeId,
  name: ({ PolicyType }) => PolicyType,
};

const memberResolvers: Resolvers<Member, Context> = {
  name: ({ FirstName, LastName }) =>
    `${(FirstName || '').trim()} ${(LastName || '').trim()}`.trim(),
  appointed: ({ AppointDtTm }) => AppointDtTm,
  expires: ({ ExpireDtTm }) => ExpireDtTm,
  status: ({ StatusName }) => StatusName,
  holdover: ({ StatusName }) => StatusName === 'Holdover',
};

export default makeExecutableSchema({
  typeDefs: [schemaGraphql],
  // We typecheck our own resolvers, so we set this as "any". Otherwise our
  // precise "args" typing conflicts with the general {[argument: string]: any}
  // type that the library gives them.
  resolvers: [
    {
      Query: queryRootResolvers,
      Commission: commissionResolvers,
      Department: departmentResolvers,
      Member: memberResolvers,
      PolicyType: policyTypeResolvers,
    },
  ] as any,
  allowUndefinedInResolve: false,
});
