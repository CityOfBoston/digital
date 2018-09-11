import SamlAuth, {
  SamlLoginResult,
  SamlAssertResult,
  SamlLogoutRequestResult,
} from './SamlAuth';

export interface SamlAuthFakeOptions {
  assertUrl: string;
  loginFormUrl: string;
  userId?: string;
}

export default class SamlAuthFake implements Required<SamlAuth> {
  private assertUrl: string;
  private loginFormUrl: string;
  private userId: string;

  constructor({ assertUrl, loginFormUrl, userId }: SamlAuthFakeOptions) {
    this.assertUrl = assertUrl;
    this.loginFormUrl = loginFormUrl;
    this.userId = userId || 'CON01234';
  }

  getMetadata(): string {
    return '<EntityDescriptor></EntityDescriptor>';
  }

  makeLoginUrl(): Promise<string> {
    return Promise.resolve(this.loginFormUrl);
  }

  makeLogoutUrl(): Promise<string> {
    return Promise.resolve(this.assertUrl);
  }

  handlePostAssert(): Promise<SamlAssertResult> {
    const result: SamlLoginResult = {
      type: 'login',
      nameId: this.userId,
      sessionIndex: 'session',
      groups: [
        'COB-Group-TestGrp01',
        'SG_AB_IAM_TEAM',
        'SG_AB_SERVICEDESK_USERS',
      ],
    };
    return Promise.resolve(result);
  }

  handleGetAssert(): Promise<SamlAssertResult> {
    const result: SamlLogoutRequestResult = {
      type: 'logout',
      nameId: this.userId,
      sessionIndex: 'session',
      successUrl: '/',
    };
    return Promise.resolve(result);
  }
}
