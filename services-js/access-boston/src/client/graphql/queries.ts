/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddMfaDevice
// ====================================================

export interface AddMfaDevice_addMfaDevice {
  sessionId: string | null;
  error: MfaError | null;
}

export interface AddMfaDevice {
  addMfaDevice: AddMfaDevice_addMfaDevice;
}

export interface AddMfaDeviceVariables {
  phoneNumber?: string | null;
  email?: string | null;
  type: VerificationType;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ChangePassword
// ====================================================

export interface ChangePassword_changePassword {
  caseId: string | null;
  status: WorkflowStatus;
  error: string | null;
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
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FetchAccountAndApps
// ====================================================

export interface FetchAccountAndApps_account {
  employeeId: string;
  firstName: string | null;
  lastName: string | null;
  needsMfaDevice: boolean;
  needsNewPassword: boolean;
  hasMfaDevice: boolean;
  resetPasswordToken: string;
  mfaRequiredDate: string | null;
  groups: string[] | null;
  email: string;
}

export interface FetchAccountAndApps_apps_categories_apps {
  title: string;
  url: string;
  iconUrl: string | null;
  description: string;
  target: string | null;
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
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FetchAccount
// ====================================================

export interface FetchAccount_account {
  employeeId: string;
  firstName: string | null;
  lastName: string | null;
  needsMfaDevice: boolean;
  needsNewPassword: boolean;
  hasMfaDevice: boolean;
  resetPasswordToken: string;
  mfaRequiredDate: string | null;
  groups: string[] | null;
  email: string;
}

export interface FetchAccount {
  account: FetchAccount_account;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ResetPassword
// ====================================================

export interface ResetPassword_resetPassword {
  caseId: string | null;
  status: WorkflowStatus;
  error: string | null;
  messages: string[];
}

export interface ResetPassword {
  resetPassword: ResetPassword_resetPassword;
}

export interface ResetPasswordVariables {
  newPassword: string;
  confirmPassword: string;
  token: string;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: VerifyMfaDevice
// ====================================================

export interface VerifyMfaDevice_verifyMfaDevice {
  success: boolean;
  error: MfaError | null;
}

export interface VerifyMfaDevice {
  verifyMfaDevice: VerifyMfaDevice_verifyMfaDevice;
}

export interface VerifyMfaDeviceVariables {
  sessionId: string;
  pairingCode: string;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum MfaError {
  ALREADY_REGISTERED = "ALREADY_REGISTERED",
  INVALID_EMAIL = "INVALID_EMAIL",
  INVALID_PHONE_NUMBER = "INVALID_PHONE_NUMBER",
  WRONG_CODE = "WRONG_CODE",
  WRONG_PASSWORD = "WRONG_PASSWORD",
}

export enum VerificationType {
  EMAIL = "EMAIL",
  SMS = "SMS",
  VOICE = "VOICE",
}

export enum WorkflowStatus {
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
  UNKNOWN = "UNKNOWN",
}

//==============================================================
// END Enums and Input Objects
//==============================================================
