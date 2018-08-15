import SamlAuth, {
  SamlLoginResult,
  SamlAssertResult,
  SamlLogoutRequestResult,
} from './SamlAuth';

export default class SamlAuthFake implements Required<SamlAuth> {
  private assertUrl: string;

  constructor(assertUrl: string) {
    this.assertUrl = assertUrl;
  }

  getMetadata(): string {
    return '<EntityDescriptor></EntityDescriptor>';
  }

  makeLoginUrl(): Promise<string> {
    return Promise.resolve('/login-form');
  }

  makeLogoutUrl(): Promise<string> {
    return Promise.resolve(this.assertUrl);
  }

  handlePostAssert(): Promise<SamlAssertResult> {
    const result: SamlLoginResult = {
      type: 'login',
      nameId: 'CON01234',
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
      nameId: 'CON01234',
      sessionIndex: 'session',
      successUrl: '/',
    };
    return Promise.resolve(result);
  }
}
