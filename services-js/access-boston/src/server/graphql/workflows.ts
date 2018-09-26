import Boom from 'boom';

import { LaunchedWorkflowResponse } from '../services/IdentityIq';

import { MutationResolvers, QueryRootResolvers } from './schema';

export enum WorkflowStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface Workflow {
  caseId: string | null;
  status: WorkflowStatus;
  messages: string[];
  error: PasswordError | null;
}

export enum PasswordError {
  NEW_PASSWORDS_DONT_MATCH = 'NEW_PASSWORDS_DONT_MATCH',
  CURRENT_PASSWORD_WRONG = 'CURRENT_PASSWORD_WRONG',
  NEW_PASSWORD_POLICY_VIOLATION = 'NEW_PASSWORD_POLICY_VIOLATION',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export const changePasswordMutation: MutationResolvers['changePassword'] = async (
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
};

export const resetPasswordMutation: MutationResolvers['resetPassword'] = async (
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
};

export const workflowQuery: QueryRootResolvers['workflow'] = async (
  _root,
  { caseId },
  { identityIq }
) => launchedWorkflowResponseToWorkflow(await identityIq.fetchWorkflow(caseId));

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
