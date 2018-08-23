/* tslint:disable */
//  This file was automatically generated and should not be edited.

export enum WorkflowStatus {
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  UNKNOWN = 'UNKNOWN',
}

export enum ChangePasswordError {
  CURRENT_PASSWORD_WRONG = 'CURRENT_PASSWORD_WRONG',
  NEW_PASSWORDS_DONT_MATCH = 'NEW_PASSWORDS_DONT_MATCH',
  NEW_PASSWORD_POLICY_VIOLATION = 'NEW_PASSWORD_POLICY_VIOLATION',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ChangePasswordMutationVariables {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordMutation {
  changePassword: {
    caseId: string | null;
    status: WorkflowStatus;
    error: ChangePasswordError | null;
    messages: Array<string>;
  };
}

export interface FetchAccountAndAppsQuery {
  account: {
    employeeId: string;
  };
  apps: {
    categories: Array<{
      title: string;
      showIcons: boolean;
      requestAccessUrl: string | null;
      apps: Array<{
        title: string;
        url: string;
        iconUrl: string | null;
        description: string;
      }>;
    }>;
  };
}

export interface FetchAccountQuery {
  account: {
    employeeId: string;
  };
}
