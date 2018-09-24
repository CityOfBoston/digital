/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ChangePassword
// ====================================================

export interface ChangePassword_changePassword {
  caseId: string | null;
  status: WorkflowStatus;
  error: PasswordError | null;
  messages: string[];
}

export interface ChangePassword {
  changePassword: ChangePassword_changePassword;
}

export interface ChangePasswordVariables {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FetchAccountAndApps
// ====================================================

export interface FetchAccountAndApps_account {
  employeeId: string;
}

export interface FetchAccountAndApps_apps_categories_apps {
  title: string;
  url: string;
  iconUrl: string | null;
  description: string;
}

export interface FetchAccountAndApps_apps_categories {
  title: string;
  showIcons: boolean;
  requestAccessUrl: string | null;
  apps: FetchAccountAndApps_apps_categories_apps[];
}

export interface FetchAccountAndApps_apps {
  categories: FetchAccountAndApps_apps_categories[];
}

export interface FetchAccountAndApps {
  account: FetchAccountAndApps_account;
  apps: FetchAccountAndApps_apps;
}

/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FetchAccount
// ====================================================

export interface FetchAccount_account {
  employeeId: string;
}

export interface FetchAccount {
  account: FetchAccount_account;
}

/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ResetPassword
// ====================================================

export interface ResetPassword_resetPassword {
  caseId: string | null;
  status: WorkflowStatus;
  error: PasswordError | null;
  messages: string[];
}

export interface ResetPassword {
  resetPassword: ResetPassword_resetPassword;
}

export interface ResetPasswordVariables {
  newPassword: string;
  confirmPassword: string;
}

/* tslint:disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum WorkflowStatus {
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  UNKNOWN = 'UNKNOWN',
}

export enum PasswordError {
  CURRENT_PASSWORD_WRONG = 'CURRENT_PASSWORD_WRONG',
  NEW_PASSWORDS_DONT_MATCH = 'NEW_PASSWORDS_DONT_MATCH',
  NEW_PASSWORD_POLICY_VIOLATION = 'NEW_PASSWORD_POLICY_VIOLATION',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

//==============================================================
// END Enums and Input Objects
//==============================================================
