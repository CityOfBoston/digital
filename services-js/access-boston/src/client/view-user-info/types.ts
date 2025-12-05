export interface Account {
  name: string;
  disabled: boolean;
}

export interface Identity {
  id: string;
  uid: string;
  legalFirstName: string;
  legalLastName: string;
  email: string;
  personalEmail?: string;
  manager?: string;
  departmentName?: string;
  location?: string;
  employmentStatus?: string;
  accountStatus?: string;
  vpnStatus?: string;
  userRegistered?: string;
  passwordExpiresOn?: string;
  accounts?: Account[];
  isEmployee?: boolean;
  endDate?: string | null;
  sponsor?: string;
}

export type DataSource = 'dummy' | 'local';
export type ActiveTab = 'attributes' | 'accounts';

