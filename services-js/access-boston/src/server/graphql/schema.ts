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
import Boom from 'boom';

import { Resolvers } from '@cityofboston/graphql-typescript';

import AppsRegistry from '../../lib/AppsRegistry';
import Session from '../Session';
import PingId, { VerificationType } from '../services/PingId';

import { Workflow } from './workflows';

import { cobraResetPasswordMutation } from './cobra-reset-password';

import { cobraChangePasswordMutation } from './cobra-workflows';

import {
  addMfaDeviceMutation,
  AddMfaDeviceResponse,
  VerifyMfaDeviceResponse,
  verifyMfaDeviceMutation,
} from './mfa';

/** @graphql schema */
export interface Schema {
  query: Query;
  mutation: Mutation;
}

export interface Query {
  notice: Notice;
  account: Account;
  apps: Apps;
}

export interface ViewUserInfoResult {
  id: string;
  uid: string;
  legalFirstName: string;
  legalLastName: string;
  middleName?: string | null;
  preferredFirstName?: string | null;
  preferredLastName?: string | null;
  displayName?: string | null;
  email: string;
  personalEmail?: string | null;
  workPhone?: string | null;
  phone?: string | null;
  manager?: string | null;
  departmentName?: string | null;
  location?: string | null;
  employmentStatus?: string | null;
  accountStatus?: string | null;
  identityState?: string | null;
  cloudLifecycleState?: string | null;
  vpnStatus?: string | null;
  userRegistered?: string | null;
  passwordExpiresOn?: string | null;
  hireDate?: string | null;
  startDate?: string | null;
  isManager?: string | null;
  positionNumber?: string | null;
  jobCode?: string | null;
  isVip?: string | null;
  accounts: ViewUserInfoAccount[];
  isEmployee: boolean;
  endDate?: string | null;
  sponsor?: string | null;
}

export interface ViewUserInfoAccount {
  name: string;
  disabled: boolean;
}

export interface Mutation {
  changePassword(args: {
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

  addMfaDevice(args: {
    phoneNumber?: string;
    email?: string;
    type: VerificationType;
  }): AddMfaDeviceResponse;

  verifyMfaDevice(args: {
    sessionId: string;
    pairingCode: string;
  }): VerifyMfaDeviceResponse;

  viewUserInfo(args: { query_string: string }): ViewUserInfoResult[];
}

export interface Account {
  employeeId: string;
  firstName: string | null;
  lastName: string | null;
  needsNewPassword: boolean;
  needsMfaDevice: boolean;
  hasMfaDevice: boolean;
  resetPasswordToken: string;
  /** ISO 8601 */
  mfaRequiredDate: string | null;
  groups: string[] | null;
  email: string;
  cobAgency: string | null;
  displayName?: string | null;
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
  target: string | null;
}

export interface Notice {
  label: string;
  text: string;
  type: string;
  exclusions: string[];
}

// This file is built by the "generate-graphql-schema" script from
// the above interfaces.
const schemaGraphql = fs.readFileSync(
  path.resolve(__dirname, '..', '..', '..', 'graphql', 'schema.graphql'),
  'utf-8'
);

import CobraClient from '../services/cobra/CobraClient';

export interface Context {
  session: Session;
  appsRegistry: AppsRegistry;
  pingId: PingId;
  cobraClient: CobraClient;
}

export type QueryRootResolvers = Resolvers<Query, Context>;
export type MutationResolvers = Resolvers<Mutation, Context>;

const queryRootResolvers: QueryRootResolvers = {
  notice: (_root, _arg, { appsRegistry }) => {
    const notice = appsRegistry.appsForNotice();

    return {
      label: notice['label'],
      text: notice['text'],
      type: notice['type'] ? notice['type'] : 'info',
      exclusions: notice['exclusions'] ? notice['exclusions'] : [''],
    };
  },

  account: (_root, _args, { session }) => {
    const { loginAuth, forgotPasswordAuth, loginSession } = session;

    if (loginAuth && loginSession) {
      const { userId } = loginAuth;
      const {
        needsMfaDevice,
        needsNewPassword,
        hasMfaDevice,
        firstName,
        lastName,
        mfaRequiredDate,
        groups,
        email,
        cobAgency,
        // displayName,
      } = loginSession;
      let mgmt_groups: Array<string> = [];
      if (typeof groups === 'object' && groups.length > 0) {
        // mgmt_groups = groups.filter(entry => entry.indexOf('SG_AB_') > -1);
        mgmt_groups = groups.filter(
          entry => entry.indexOf('SG_AB_GRPMGMT_') > -1
        );
      }

      return {
        employeeId: userId,
        firstName: firstName || null,
        lastName: lastName || null,
        needsMfaDevice,
        needsNewPassword,
        hasMfaDevice,
        resetPasswordToken: '',
        mfaRequiredDate: mfaRequiredDate ? mfaRequiredDate : null,
        groups: mgmt_groups,
        email: email,
        cobAgency,
        displayName: null, // Field required by schema even when optional
      };
    } else if (forgotPasswordAuth) {
      return {
        employeeId: forgotPasswordAuth.userId,
        firstName: null,
        lastName: null,
        // These aren't used in forgot password states, so it doesn’t matter
        // what we return here.
        needsMfaDevice: false,
        needsNewPassword: false,
        hasMfaDevice: false,
        resetPasswordToken: forgotPasswordAuth.resetPasswordToken,
        mfaRequiredDate: null,
        groups: [''],
        email: '',
        cobAgency: '',
        displayName: null, // Field required by schema even when optional
      };
    } else {
      // This must have the message "Forbidden" because it’s matched explicitly
      // in _app.tsx.
      throw Boom.forbidden('Forbidden', session.sessionDebugInfo());
    }
  },

  apps: (_root, _args, { appsRegistry, session }) => {
    const { loginSession } = session;

    if (!loginSession) {
      // This must have the message "Forbidden" because it’s matched explicitly
      // in _app.tsx.
      throw Boom.forbidden('Forbidden', session.sessionDebugInfo());
    }

    return {
      categories: appsRegistry
        .appsForGroups(
          loginSession.groups,
          loginSession.hasMfaDevice,
          loginSession.cobAgency || null
        )
        .map(({ apps, icons, showRequestAccessLink, title }) => {
          const retObj = {
            title,
            showIcons: icons,
            requestAccessUrl: showRequestAccessLink ? '#' : null,
            apps: apps.map(({ title, iconUrl, url, description, target }) => ({
              title,
              iconUrl: iconUrl || null,
              url,
              description,
              target,
            })),
          };
          if (retObj.title === 'Support Tools') {
            const filterGroups = loginSession.groups.filter(
              entry => entry.indexOf('SG_AB_GRPMGMT_') > -1
            );
            if (filterGroups.length < 1) {
              retObj.apps = apps.filter(
                entry => entry.title !== 'Group Management'
              );
            }
          }
          return retObj;
        }),
    };
  },
};

const mutationResolvers: MutationResolvers = {
  changePassword: cobraChangePasswordMutation,
  resetPassword: cobraResetPasswordMutation,
  addMfaDevice: addMfaDeviceMutation,
  verifyMfaDevice: verifyMfaDeviceMutation,
  
  viewUserInfo: async (_root, { query_string }, { cobraClient, session }) => {
    // Require authentication - user must be logged in to view user info
    const { loginAuth, loginSession } = session;

    if (!loginAuth || !loginSession) {
      // This must have the message "Forbidden" because it's matched explicitly
      // in _app.tsx.
      throw Boom.forbidden('Forbidden', session.sessionDebugInfo());
    }

    const ViewUserInfo = require('../services/cobra/ViewUserInfo').default;
    const viewUserInfoService = new ViewUserInfo(cobraClient);
    
    try {
      console.log('[ViewUserInfo resolver] Starting request for query_string:', query_string);
      const response = await viewUserInfoService.process({ query_string });
      console.log('[ViewUserInfo resolver] Successfully received response, count:', response.length);
      
      // Validate the response structure before returning
      if (!Array.isArray(response)) {
        console.error('[ViewUserInfo resolver] Response is not an array:', typeof response);
        throw new Error('Invalid response type - expected array');
      }
      
      // Check each item has required fields
      response.forEach((item, index) => {
        if (!item.uid || !item.email) {
          console.warn(`[ViewUserInfo resolver] Item ${index} missing required fields:`, {
            hasUid: !!item.uid,
            hasEmail: !!item.email
          });
        }
      });
      
      console.log('[ViewUserInfo resolver] Returning', response.length, 'valid items');
      return response;
    } catch (error) {
      console.error('[ViewUserInfo resolver] Error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        query_string
      });
      throw new Error(
        error instanceof Error 
          ? `Failed to fetch user info: ${error.message}`
          : 'An unexpected error occurred while fetching user info'
      );
    }
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
