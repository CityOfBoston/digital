import CobraClient from './CobraClient';

export interface GetUserDetailsArgs {
  samaccountname: string;
}

export interface DeviceDetails {
  type: string;
  osVersion: string | null;
  appVersion: string | null;
  enrollment: string;
  phoneNumber: string;
  countryCode: string;
  sentNotClaimedSms: number;
  sentClaimedSms: number;
  availableNotClaimedSms: number;
  availableClaimedSms: number;
  pushEnabled: boolean;
  email: string | null;
  deviceId: number;
  deviceUuid: string;
  deviceRole: string;
  nickname: string;
  deviceModel: string | null;
  displayID: string;
  oathSerialNumber: string | null;
  oathTokenType: string | null;
  publicKey: string | null;
  order: number;
  credentialId: string | null;
  userHandle: string | null;
  authenticatorAttachment: string | null;
  transports: string | null;
  hasWatch: boolean;
}

export interface ServiceProvider {
  spAlias: string;
  spName: string;
  bypassExpiration: string | null;
  status: string;
}

export interface GetUserDetailsResponse {
  fname: string;
  lname: string;
  status: string;
  email: string;
  userName: string;
  picURL: string;
  role: string;
  lastLogin: string | null;
  bypassExpiration: string | null;
  userId: number;
  deviceDetails: DeviceDetails;
  devicesDetails: DeviceDetails[];
  lastTransactions: string[];
  spList: ServiceProvider[];
  userInBypass: boolean;
  userEnabled: boolean;
}

export default class GetUserDetails {
  private client: CobraClient;

  constructor(client: CobraClient) {
    this.client = client;
  }

  async process(args: GetUserDetailsArgs): Promise<GetUserDetailsResponse> {
    try {
      const response = await this.client.getUserDetails(args);
      return response;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get user details');
    }
  }
}
