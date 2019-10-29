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
        'SG_AB_SERVICEDESK_USERS',
        'SG_AB_GRPMGMT_CIVIS',
        'SG_AB_GRPMGMT_EBUILDER',
        'SG_AB_GRPMGMT_AUDITING',
        // 'SG_AB_GRPMGMT_PSHCM',
        // 'SG_AB_GRPMGMT_Lagan_Groups',
      ],
      needsNewPassword: isNewUser,
      needsMfaDevice: isNewUser && userId !== 'NEW88888',
      hasMfaDevice: !isNewUser,
      userAccessToken: 'jfqWE7DExC4nUa7pvkABezkM4oNT',
      userMfaRegistrationDate: '04/17/2019',
      cobAgency: 'CH',
    };
    // eslint-disable-next-line no-console
    // console.log('SamlAuthFake > result: ', result);
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
