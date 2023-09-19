import SamlAuth, {
  SamlLoginResult,
  SamlAssertResult,
  SamlLogoutRequestResult,
} from './SamlAuth';
import { RequestQuery } from 'hapi';

export interface SamlAuthFakeOptions {
  loginFormUrl: string;
}

export default class SamlAuthFake implements Required<SamlAuth> {
  private loginFormUrl: string;

  constructor({ loginFormUrl }: SamlAuthFakeOptions) {
    this.loginFormUrl = loginFormUrl;
  }

  getMetadata(): string {
    return '<EntityDescriptor></EntityDescriptor>';
  }

  makeLoginUrl(): Promise<string> {
    return Promise.resolve(this.loginFormUrl);
  }

  makeLogoutSuccessUrl(): Promise<string> {
    return Promise.resolve('/');
  }

  handlePostAssert(body: any): Promise<SamlAssertResult> {
    const userId = body.userId;

    if (!userId) {
      throw new Error('userId is blank');
    }

    const isNewUser = userId.startsWith('NEW');

    const result: SamlLoginResult = {
      type: 'login',
      nameId: userId,
      sessionIndex: 'session',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@boston.gov',
      groups: [
        'COB-Group-TestGrp01',
        'SG_AB_IAM_TEAM',
        'SG_AB_TANIUM',
        'SG_AB_SERVICEDESK_USERS',
        'SG_AB_BLDGMAINTREQ',
        'SG_AB_CONFIRMID',
        'SG_AB_Proofpoint',
        'SG_AB_AGILEPOINT',
        'SG_AB_IAM_TEAM',
        'SG_AB_IAM_VENTURES',
        'SG_AB_GRPMGMT_Lagan_Groups',
        'SG_AB_GRPMGMT_AUDITING',
        'SG_AB_GRPMGMT_TANIUM',
        'SG_AB_GRPMGMT_BLDGMAINTREQ',
        'SG_AB_GRPMGMT_EBUILDER',
        'SG_AB_GRPMGMT_CIVIS',
        // ------------------------ //
        // 'SG_AB_GRPMGMT_SERVICEDESKVIEWONLY',
        // 'SG_AB_GRPMGMT_PSHCM',
        // 'SG_AB_GRPMGMT_BOSTONDOTGOV',
        // 'SG_AB_BOSTONDOTGOV',
        // 'SG_AB_GRPMGMT_NETSCALER',
        // ------------------------ //
        // ------------------------ //
        // ------------------------ //
        // 'INFO_Unsheltered_Persons',
        // 'INFO_BLOCKED_CASES',
        // 'PWDx_Permitting (Internal)',
        // 'Lagan_Crm_Group',
        // 'ManagementInfoSvcs',
        // 'all_users',
        // 'SG_AB_TABLEAU',
        // 'SG_AB_SERVICENOW',
        // 'SG_AB_NETSCALER_EMERGENCY_VPN',
        // 'VM Email Group',
        // 'VM Case Group',
        // 'Temporary Events',
        // 'Telephony',
        // 'SG_AB_LAGAN',
        // 'Reclassify_Cases',
        // 'PWDx_WM_Mattress_Pickup',
        // 'PWDx_STRL Pole Compliance',
        // 'PWDx_Street Light Outages',
        // 'PWDx_Street Light Knock Downs',
        // 'PWDx_Street Light Knockdown Replacement',
        // 'PWDx_Requests for Pothole Repair',
        // 'PWDx_Recycle Bins',
        // 'PWDx_Permitting_Internal',
        // 'PWDx_News Boxes',
        // 'PWDx_Missed Trash',
        // 'PWDx_Graffiti',
        // 'PWDx_Empty Litter Basket',
        // 'PWDx_District_02_Jamaica_Plain',
        // 'PWDx_Code Enforcement',
        // 'PROP_GRAF_GraffitiRemoval',
        // 'PARK_Urban_Wilds',
        // 'PARK_Tree Maintenance Request',
        // 'PARK_Tree in Park',
        // 'PARK_Tree Emergencies',
        // 'PARK_New Tree Requests',
        // 'PARK_Maintenance_Trades',
        // 'PARK_Maintenance_Region 6',
        // 'PARK_Maintenance_Region 5',
        // 'PARK_Maintenance_Region 4',
        // 'PARK_Maintenance_Region 3',
        // 'PARK_Maintenance_Region 2',
        // 'PARK_Maintenance_Region 1',
        // 'PARK_Maintenance_Lighting Electrical',
        // 'PARK_Maintenance_Horticulture',
        // 'PARK_Maintenance_Ground Maintenance',
        // 'LocationQuery',
        // 'KnowledgeSearch',
        // 'ISD_Plumbing',
        // 'ISD_Electrical',
        // 'INFO_HumanWaste',
        // 'INFO_Encampments',
        // 'INFO03_Mobile Other Requests',
        // 'INFO02_SelfServiceGenericeFormforOtherServiceReque',
        // 'INFO01_GenericeFormforOtherServiceRequestTypes',
        // 'Hotline Level 3',
        // 'Hotline Level 2',
        // 'Hotline Base Group',
        // 'GRNi_Green_Infrastructure',
        // 'GEN18_Needle_Pickup',
        // 'dth_standard',
        // 'Department Level 3',
        // 'Department Level 2',
        // 'Department Base Group',
        // 'Configuration',
        // 'CoB eMail Group',
        // 'BTDT_Traffic Signal Repair',
        // 'BTDT_Sign Repair',
        // 'BTDT_Parking Enforcement',
        // 'BTDT_District 06',
        // 'BTDT_District 01',
        // 'BTDT_AVRS Interface Queue',
        // 'BTDT_Abandoned Bicycle',
        // 'ANML_General',
        // 'Adm Vw Emergency Notification Email Updates',
        // 'Administrator View For Dept Email Updates',
        // 'SG_AB_CIVIS',
        // 'SG_AB_SPONSOR',
        // 'SG_AB_Proofpoint',
        // 'SG_AB_MLP',
        // 'SG_AB_MANAGER',
        // 'SG_AB_GRPMGMT_Lagan_Groups',
        // 'SG_AB_ESS',
        // 'SG_AB_DOIT',
        // 'SG_AB_AGILEPOINT',
      ],
      needsNewPassword: isNewUser,
      needsMfaDevice: isNewUser && userId !== 'NEW88888',
      hasMfaDevice: !isNewUser,
      userAccessToken: 'jfqWE7DExC4nUa7pvkABezkM4oNT',
      userMfaRegistrationDate: '04/17/2019',
      cobAgency: 'CH',
    };
    return Promise.resolve(result);
  }

  handleGetAssert(query: RequestQuery): Promise<SamlAssertResult> {
    const result: SamlLogoutRequestResult = {
      type: 'logout',
      requestId: '4',
      nameId: Array.isArray(query.userId) ? query.userId[0] : query.userId,
      sessionIndex: 'session',
    };
    return Promise.resolve(result);
  }
}

export function makeFakeLoginHandler(path: string, userId: string) {
  return () =>
    `<form action="${path}" method="POST">
          <div>${path}</div>
          <input type="text" name="userId" value="${userId}" />
          <input type="submit" value="Log In" />
        </form>`;
}
