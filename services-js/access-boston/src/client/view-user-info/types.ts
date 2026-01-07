export interface Account {
  name: string;
  disabled: boolean;
}

export interface Identity {
  id: string;
  uid: string;
  legalFirstName: string;
  legalLastName: string;
  middleName?: string;
  preferredFirstName?: string;
  preferredLastName?: string;
  displayName?: string;
  email: string;
  personalEmail?: string;
  workPhone?: string;
  phone?: string;
  manager?: string;
  departmentName?: string;
  location?: string;
  employmentStatus?: string;
  accountStatus?: string;
  identityState?: string;
  vpnStatus?: string;
  userRegistered?: string;
  passwordExpiresOn?: string;
  hireDate?: string;
  startDate?: string;
  isManager?: string;
  positionNumber?: string;
  jobCode?: string;
  isVip?: string;
  accounts?: Account[];
  isEmployee?: boolean;
  endDate?: string | null;
  sponsor?: string;
}

export type DataSource = 'dummy' | 'local';
export type ActiveTab = 'attributes' | 'accounts';

