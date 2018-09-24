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
import Session from '../Session';
import IdentityIq, { LaunchedWorkflowResponse } from '../services/IdentityIq';
import Boom from 'boom';

/** @graphql schema */
export interface Schema {
  query: Query;
  mutation: Mutation;
}

export interface Query {
  account: Account;
  apps: Apps;
  workflow(args: { caseId: string }): Workflow;
}

export interface Mutation {
  changePassword(args: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Workflow;

  /**
   * Resets the password. Requires that the user be logged in with the "forgot
   * password" authentication.
   */
  resetPassword(args: {
    newPassword: string;
    confirmPassword: string;
  }): Workflow;
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

export enum WorkflowStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  UNKNOWN = 'UNKNOWN',
}

export enum PasswordError {
  NEW_PASSWORDS_DONT_MATCH = 'NEW_PASSWORDS_DONT_MATCH',
  CURRENT_PASSWORD_WRONG = 'CURRENT_PASSWORD_WRONG',
  NEW_PASSWORD_POLICY_VIOLATION = 'NEW_PASSWORD_POLICY_VIOLATION',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface Workflow {
  caseId: string | null;
  status: WorkflowStatus;
  messages: string[];
  error: PasswordError | null;
}

// This file is built by the "generate-graphql-schema" script from
// the above interfaces.
const schemaGraphql = fs.readFileSync(
  path.resolve(__dirname, '..', '..', '..', 'graphql', 'schema.graphql'),
  'utf-8'
);

export interface Context {
  session: Session;
  appsRegistry: AppsRegistry;
  identityIq: IdentityIq;
}

const queryRootResolvers: Resolvers<Query, Context> = {
  account: (_root, _args, { session: { loginAuth, forgotPasswordAuth } }) => {
    let employeeId;

    if (loginAuth) {
      employeeId = loginAuth.userId;
    } else if (forgotPasswordAuth) {
      employeeId = forgotPasswordAuth.userId;
    } else {
      throw Boom.forbidden();
    }

    return {
      employeeId,
    };
  },

  apps: (_root, _args, { appsRegistry, session: { loginSession } }) => {
    if (!loginSession) {
      throw Boom.forbidden();
    }

    return {
      categories: appsRegistry
        .appsForGroups(loginSession.groups)
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
    };
  },

  workflow: async (_root, { caseId }, { identityIq }) =>
    launchedWorkflowResponseToWorkflow(await identityIq.fetchWorkflow(caseId)),
};

const mutationResolvers: Resolvers<Mutation, Context> = {
  changePassword: async (
    _root,
    { currentPassword, newPassword, confirmPassword },
    { identityIq, session: { loginAuth } }
  ) => {
    if (!loginAuth) {
      throw Boom.forbidden();
    }

    if (newPassword !== confirmPassword) {
      return {
        caseId: null,
        error: PasswordError.NEW_PASSWORDS_DONT_MATCH,
        messages: [],
        status: WorkflowStatus.ERROR,
      };
    }

    const workflowResponse = await identityIq.changePassword(
      loginAuth.userId,
      currentPassword,
      newPassword
    );

    return launchedWorkflowResponseToWorkflow(workflowResponse);
  },

  resetPassword: async (
    _root,
    { newPassword, confirmPassword },
    { identityIq, session }
  ) => {
    const { forgotPasswordAuth } = session;

    if (!forgotPasswordAuth) {
      throw Boom.forbidden();
    }

    if (newPassword !== confirmPassword) {
      return {
        caseId: null,
        error: PasswordError.NEW_PASSWORDS_DONT_MATCH,
        messages: [],
        status: WorkflowStatus.ERROR,
      };
    }

    const workflowResponse = await identityIq.resetPassword(
      forgotPasswordAuth.userId,
      newPassword
    );

    if (workflowResponse.completionStatus === 'Success') {
      // If the password was changed successfully, clear the session so they
      // can't reset again.
      //
      // Note that in the non-JS case, this "clear" doesn't actually delete the
      // cookie, since it's called via an "inject" and we don't attempt to
      // propagate Set-Cookie headers back up. But, since the session is stored
      // server-side, we can still invalidate it. The cookie will match to
      // nothing.
      session.reset();
    }

    return launchedWorkflowResponseToWorkflow(workflowResponse);
  },
};

export default makeExecutableSchema({
  typeDefs: [schemaGraphql],
  // We typecheck our own resolvers, so we set this as "any". Otherwise our
  // precise "args" typing conflicts with the general {[argument: string]: any}
  // type that the library gives them.
  resolvers: [
    {
      Query: queryRootResolvers,
      Mutation: mutationResolvers,
    },
  ] as any,
  allowUndefinedInResolve: false,
});

function launchedWorkflowResponseToWorkflow(
  workflowResponse: LaunchedWorkflowResponse
): Workflow {
  let status: WorkflowStatus;

  switch (workflowResponse.completionStatus) {
    case 'Error':
      status = WorkflowStatus.ERROR;
      break;
    case 'Success':
      status = WorkflowStatus.SUCCESS;
      break;
    default:
      status = WorkflowStatus.UNKNOWN;
  }

  const messages = workflowResponse.messages;
  let error: PasswordError | null = null;

  if (status === WorkflowStatus.ERROR) {
    if (messages.find(m => m === 'Current Password Check Failure')) {
      error = PasswordError.CURRENT_PASSWORD_WRONG;
    } else if (
      messages.find(m => m.includes('Password Policy Compliance Failure'))
    ) {
      error = PasswordError.NEW_PASSWORD_POLICY_VIOLATION;
    } else {
      error = PasswordError.UNKNOWN_ERROR;
    }
  }

  return {
    caseId: workflowResponse.id,
    messages,
    error,
    status,
  };
}
