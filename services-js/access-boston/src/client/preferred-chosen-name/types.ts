export type PreferredChosenNameStep =
  | 'welcome'
  | 'enterName'
  | 'approval'
  | 'success'
  | 'error';

export type View =
  | 'welcomeView'
  | 'enterNameView'
  | 'approvalView'
  | 'successView'
  | 'errorView';

export type Action = '' | 'new';

export interface FormInputs {
  Id: string;
  FName?: string;
  LName?: string;
  Email?: string;
  fetchNameReqRes?: boolean;
  fetchNameReqResError?: boolean;
  submitNameChangeReq?: boolean;
  submitNameChangeReqError?: boolean;
}

export interface CommonAttributes {
  init: boolean;
  step?: number | null;
  view?: number;
  altWorkflow?: boolean;

  employeeId: string;
  employeeType: string;
  firstName: string;
  lastName: string;
  chosenFirstName: string;
  chosenLastName: string;
  email: string;
  newEmail?: string;
  displayName?: string;
  fetchNameReqRes: boolean;
  fetchNameReqResError: boolean;
  submitNameChangeReq: boolean;
  submitNameChangeReqError: boolean;
}

export class PreferredChosenNameInformation implements CommonAttributes {
  init: boolean = false;
  step: number | null = null;
  view: number = 0;
  altWorkflow: boolean = false;

  employeeId: string = '';
  employeeType: string = '';
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  chosenFirstName: string = '';
  chosenLastName: string = '';
  newEmail: string = '';
  displayName: string = '';

  fetchNameReqRes: boolean = false;
  fetchNameReqResError: boolean = false;
  submitNameChangeReq: boolean = false;
  submitNameChangeReqError: boolean = false;

  constructor(opt?: {
    init?: boolean;
    step?: number;
    view?: number;
    altWorkflow?: boolean;

    employeeId?: string;
    employeeType?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    chosenFirstName?: string;
    chosenLastName?: string;
    newEmail?: string;
    displayName?: string;

    fetchNameReqRes?: boolean;
    fetchNameReqResError?: boolean;
    submitNameChangeReq?: boolean;
    submitNameChangeReqError?: boolean;
  }) {
    (this.init = opt && opt.init ? opt.init : true),
      (this.step = opt && opt.step ? opt.step : 0),
      (this.view = opt && opt.view ? opt.view : 0),
      (this.altWorkflow = opt && opt.altWorkflow ? opt.altWorkflow : false),
      (this.employeeId = opt && opt.employeeId ? opt.employeeId : ''),
      (this.employeeType = opt && opt.employeeType ? opt.employeeType : ''),
      (this.firstName = opt && opt.firstName ? opt.firstName : ''),
      (this.lastName = opt && opt.lastName ? opt.lastName : ''),
      (this.email = opt && opt.email ? opt.email : ''),
      (this.chosenFirstName =
        opt && opt.chosenFirstName ? opt.chosenFirstName : ''),
      (this.chosenLastName =
        opt && opt.chosenLastName ? opt.chosenLastName : ''),
      (this.newEmail = opt && opt.newEmail ? opt.newEmail : ''),
      (this.displayName = opt && opt.displayName ? opt.displayName : ''),
      (this.fetchNameReqRes =
        opt && opt.fetchNameReqRes ? opt.fetchNameReqRes : false),
      (this.fetchNameReqResError =
        opt && opt.fetchNameReqResError ? opt.fetchNameReqResError : false),
      (this.submitNameChangeReq =
        opt && opt.submitNameChangeReq ? opt.submitNameChangeReq : false),
      (this.submitNameChangeReqError =
        opt && opt.submitNameChangeReqError
          ? opt.submitNameChangeReqError
          : false);
  }
}
