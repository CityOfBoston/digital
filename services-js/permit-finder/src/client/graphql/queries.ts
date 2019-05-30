/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: LoadPermit
// ====================================================

export interface LoadPermit_permit_milestones {
  milestoneName: string;
  milestoneStartDate: string;
  cityContactName: string | null;
}

export interface LoadPermit_permit_reviews {
  isComplete: boolean;
  type: string;
}

export interface LoadPermit_permit {
  permitNumber: string;
  kind: PermitKind;
  type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  milestones: LoadPermit_permit_milestones[];
  reviews: LoadPermit_permit_reviews[];
}

export interface LoadPermit {
  permit: LoadPermit_permit | null;
}

export interface LoadPermitVariables {
  permitNumber: string;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum PermitKind {
  BUILDING = "BUILDING",
  FIRE = "FIRE",
}

//==============================================================
// END Enums and Input Objects
//==============================================================
