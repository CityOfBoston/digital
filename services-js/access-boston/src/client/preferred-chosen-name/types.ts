export type PreferredChosenNameStep = 'intro' | 'form' | 'review' | 'success';

export type View = 'intro' | 'form' | 'verify' | 'success';

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

// export type stateType = {
//     step: number | null;
//     view: number;

//     employeeId: string;
//     employeeType: string;
//     fname: string;
//     lname: string;
//     chosenFirstName: string;
//     chosenLastName: string;
//     email: string;
// };
