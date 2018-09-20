import querystring from 'querystring';

import SamlAuth, {
  SamlLoginResult,
  SamlAssertResult,
  SamlLogoutRequestResult,
} from './SamlAuth';
import { RequestQuery } from 'hapi';

export interface SamlAuthFakeOptions {
  assertUrl: string;
  loginFormUrl: string;
}

export default class SamlAuthFake implements Required<SamlAuth> {
  private assertUrl: string;
  private loginFormUrl: string;

  constructor({ assertUrl, loginFormUrl }: SamlAuthFakeOptions) {
    this.assertUrl = assertUrl;
    this.loginFormUrl = loginFormUrl;
  }

  getMetadata(): string {
    return '<EntityDescriptor></EntityDescriptor>';
  }

  makeLoginUrl(): Promise<string> {
    return Promise.resolve(this.loginFormUrl);
  }

  makeLogoutUrl(userId: string): Promise<string> {
    return Promise.resolve(
      this.assertUrl + `?userId=${encodeURIComponent(userId)}`
    );
  }

  handlePostAssert(body: string): Promise<SamlAssertResult> {
    const payload = querystring.parse(body.trim());

    const result: SamlLoginResult = {
      type: 'login',
      nameId: Array.isArray(payload.userId)
        ? payload.userId[0]
        : payload.userId,
      sessionIndex: 'session',
      groups: [
        'COB-Group-TestGrp01',
        'SG_AB_IAM_TEAM',
        'SG_AB_SERVICEDESK_USERS',
      ],
    };
    return Promise.resolve(result);
  }

  handleGetAssert(query: RequestQuery): Promise<SamlAssertResult> {
    const result: SamlLogoutRequestResult = {
      type: 'logout',
      nameId: Array.isArray(query.userId) ? query.userId[0] : query.userId,
      sessionIndex: 'session',
      successUrl: '/',
    };
    return Promise.resolve(result);
  }
}

export function makeFakeLoginHandler(path: string, userId: string) {
  return () =>
    `<form action="${path}" method="POST" enctype="text/plain">
          <div>${path}</div>
          <input type="text" name="userId" value="${userId}" />
          <input type="submit" value="Log In" />
        </form>`;
}
