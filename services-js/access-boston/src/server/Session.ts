import { Request as HapiRequest } from 'hapi';

const SESSION_AUTH_KEY = 'auth';

// We keep these distinct to guard against accidentally reading one when we want
// the other.
export const LOGIN_SESSION_KEY = 'loginSession';
export const FORGOT_PASSWORD_SESSION_KEY = 'loginSession';

export interface LoginAuth {
  type: 'login';
  userId: string;
  sessionIndex: string;
}

export interface ForgotPasswordAuth {
  type: 'forgotPassword';
  userId: string;
}

declare module 'hapi' {
  interface AuthCredentials {
    loginAuth?: LoginAuth;
    forgotPasswordAuth?: ForgotPasswordAuth;
  }
}

export interface LoginSession {
  type: 'login';
  groups: string[];
}

export type SessionAuth = LoginAuth | ForgotPasswordAuth;

/**
 * The SAML bits save auth information in the Yar session, though for the
 * application itself login information should be pulled off of the
 * request.auth.credentials object.
 */
export function setSessionAuth(request: HapiRequest, auth: SessionAuth) {
  request.yar.set(SESSION_AUTH_KEY, auth);
}

/**
 * Returns the Auth object stored in the Yar session.
 *
 * @param request Hapi request
 * @param keepAlive If true, touches the session so that its expiration timer is
 * reset
 */
export function getSessionAuth(
  request: HapiRequest,
  keepAlive: boolean = false
): SessionAuth | undefined {
  if (keepAlive) {
    request.yar.touch();
  }

  return request.yar.get(SESSION_AUTH_KEY);
}

export default class Session {
  private request: HapiRequest;

  // By making these optionally undefined we can use type checking to ensure
  // that we're making auth checks in our resolvers. If you want to use one of
  // these but it's undefined then it's time to throw a Forbidden error.
  public readonly loginAuth: LoginAuth | undefined;
  public readonly forgotPasswordAuth: ForgotPasswordAuth | undefined;

  public readonly loginSession: LoginSession | undefined;

  constructor(request: HapiRequest) {
    this.request = request;

    // TODO(finh): It may be a bit confusing to round-trip these credentials in
    // and out of request.auth when they're already in the Yar session. Possibly
    // clean that up?
    const { isAuthenticated, credentials } = request.auth;
    if (isAuthenticated && credentials) {
      this.loginAuth = credentials.loginAuth;
      this.forgotPasswordAuth = credentials.forgotPasswordAuth;
    }

    this.loginSession = request.yar.get(LOGIN_SESSION_KEY);
  }

  reset() {
    this.request.yar.reset();
  }
}
