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

import { makeExecutableSchema } from 'graphql-tools';
import { Resolvers } from '@cityofboston/graphql-typescript';
import AppsRegistry from '../services/AppsRegistry';
import SamlAuth from '../services/SamlAuth';
import SessionAuth from '../SessionAuth';

/** @graphql schema */
export interface Schema {
  query: Query;
}

export interface Query {
  account: Account;
  apps: Apps;
}

export interface Account {
  employeeId: string;
}

export interface Apps {
  categories: AppCategory[];
}

export interface AppCategory {
  title: string;
  showIcons: boolean;
  requestAccessUrl: string | null;

  apps: App[];
}

export interface App {
  title: string;
  url: string;
  iconUrl: string | null;
  description: string;
}

// This file is built by the "generate-graphql-schema" script from
// the above interfaces.
const schemaGraphql = fs.readFileSync(
  path.resolve(__dirname, '..', '..', '..', 'graphql', 'schema.graphql'),
  'utf-8'
);

export interface Context {
  sessionAuth: SessionAuth;
  appsRegistry: AppsRegistry;
  samlAuth: SamlAuth;
}

const queryRootResolvers: Resolvers<Query, Context> = {
  account: (_root, _args, { sessionAuth }) => {
    const session = sessionAuth.get();

    return {
      employeeId: session.nameId,
    };
  },

  apps: (_root, _args, { appsRegistry, sessionAuth }) => ({
    categories: appsRegistry
      .appsForGroups(sessionAuth.get().groups)
      .map(({ apps, icons, showRequestAccessLink, title }) => ({
        title,
        showIcons: icons,
        requestAccessUrl: showRequestAccessLink ? '#' : null,
        apps: apps.map(({ title, iconUrl, url, description }) => ({
          title,
          iconUrl: iconUrl || null,
          url,
          description,
        })),
      })),
  }),
};

export default makeExecutableSchema({
  typeDefs: [schemaGraphql],
  // We typecheck our own resolvers, so we set this as "any". Otherwise our
  // precise "args" typing conflicts with the general {[argument: string]: any}
  // type that the library gives them.
  resolvers: [
    {
      Query: queryRootResolvers,
    },
  ] as any,
  allowUndefinedInResolve: false,
});
