// This file contains type definitions and deprecated IdentityIQ-based functions.
// The type definitions (WorkflowStatus, Workflow, PasswordError) are still used by COBRA implementations.
// The functions (changePasswordMutation, resetPasswordMutation, workflowQuery) are DEPRECATED.
// Use cobra-workflows.ts and cobra-reset-password.ts instead.

export enum WorkflowStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface Workflow {
  caseId: string | null;
  status: WorkflowStatus;
  messages: string[];
  error: string | null;
}

export enum PasswordError {
  NO_SESSION = 'NO_SESSION',
  NEW_PASSWORDS_DONT_MATCH = 'NEW_PASSWORDS_DONT_MATCH',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// DEPRECATED: Use cobraChangePasswordMutation from cobra-workflows.ts instead
// This function is kept for reference only and should not be used
/*
export const changePasswordMutation: MutationResolvers['changePassword'] = async (
  _root,
  { newPassword, confirmPassword },
  { identityIq, session }
) => {
  // ... old IdentityIQ implementation ...
};
*/

// DEPRECATED: Use cobraResetPasswordMutation from cobra-reset-password.ts instead
// This function is kept for reference only and should not be used
/*
export const resetPasswordMutation: MutationResolvers['resetPassword'] = async (
  _root,
  { newPassword, confirmPassword },
  { identityIq, session }
) => {
  // ... old IdentityIQ implementation ...
};
*/

// DEPRECATED: Workflow polling is no longer needed with COBRA
// COBRA operations complete synchronously and don't require polling
/*
export const workflowQuery: QueryRootResolvers['workflow'] = async (
  _root,
  { caseId },
  { identityIq }
) => launchedWorkflowResponseToWorkflow(await identityIq.fetchWorkflow(caseId));
*/
