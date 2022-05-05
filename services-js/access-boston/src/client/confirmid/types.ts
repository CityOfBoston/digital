export type IdentityVerificationStep =
  | 'enterId'
  | 'validate'
  | 'review'
  | 'success';

export type View =
  | 'enterId'
  | 'validate'
  | 'review'
  | 'success'
  | 'failure'
  | 'quit';

export type Action = '' | 'new';

export type stateType = {
  step: number | null;
  view: number;

  employeeId: string;
  fname: string;
  lname: string;
  ssn: string;
  dob: string;
  employeeType: string;
};

export interface CommonAttributes {
  step: number | null;
  view: number;
  employeeId: string;
  fname: string;
  lname: string;
  ssn: string;
  dob: string;
  employeeType: string;
}

export class IdentityVerificationRequestInformation
  implements CommonAttributes {
  step: number | null = null;
  view: number = 0;
  employeeId: string = '';
  fname: string = '';
  lname: string = '';
  ssn: string = '';
  dob: string = '';
  employeeType: string = '';
}
