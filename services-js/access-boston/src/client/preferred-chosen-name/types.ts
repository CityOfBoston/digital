export type PreferredChosenNameStep =
  | 'welcome'
  | 'enterName'
  | 'approval'
  | 'success';

export type View =
  | 'welcomeView'
  | 'enterNameView'
  | 'approvalView'
  | 'successView';

export type Action = '' | 'new';

export interface CommonAttributes {
  step: number | null;
  view: number;

  employeeId: string;
  employeeType: string;
  fname: string;
  lname: string;
  chosenFirstName: string;
  chosenLastName: string;
  email: string;
}

export class PreferredChosenNameInformation implements CommonAttributes {
  step: number | null = null;
  view: number = 0;

  employeeId: string = '';
  employeeType: string = '';
  fname: string = '';
  lname: string = '';
  chosenFirstName: string = '';
  chosenLastName: string = '';
  email: string = '';
}
