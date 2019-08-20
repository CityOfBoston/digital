import { Request as HapiRequest } from 'hapi';

const SESSION_AUTH_KEY = 'auth';

// We keep these distinct to guard against accidentally reading one when we want
// the other.
export const LOGIN_SESSION_KEY = 'loginSession';
export const FORGOT_PASSWORD_SESSION_KEY = 'loginSession';

// Increase this to invalidate existing logins. Necessary when we need sessions
// to get new data from the SAML login assertion.
export const CURRENT_SESSION_VERSION = 2;

export interface LoginAuth {
  type: 'login';
  sessionVersion: number | undefined;
  userId: string;
  sessionIndex: string;
  createdTime: number;
}

export interface ForgotPasswordAuth {
  type: 'forgotPassword';
  sessionVersion: number | undefined;
  userId: string;
  resetPasswordToken: string;
  createdTime: number;
}

declare module 'hapi' {
  interface AuthCredentials {
    loginAuth?: LoginAuth;
    forgotPasswordAuth?: ForgotPasswordAuth;
  }
}

/**
 * Everything in this interface needs to serialize to JSON.
 *
 * When making backwards-incompatible changes to this, update
 * LOGIN_SESSION_VERSION.
 */
export interface LoginSession {
  type: 'login';

  firstName: string;
  lastName: string;
  email: string;
  groups: string[];
  needsNewPassword: boolean;
  needsMfaDevice: boolean;
  // ISO 8601 date
  mfaRequiredDate: string | null;
  hasMfaDevice: boolean;

  // We want these in the session because we need to update IIQ with the email
  // or phone number that was used, once device verification succeeds.
  mfaSessionId: string | null;
  mfaEmail: string | null;
  mfaPhoneNumber: string | null;

  cobAgency: string | null;
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

  const sessionAuth: SessionAuth | undefined = request.yar.get(
    SESSION_AUTH_KEY
  );

  if (
    sessionAuth &&
    (sessionAuth.sessionVersion || 0) < CURRENT_SESSION_VERSION
  ) {
    // Old session, so let’s delete it and return undefined so that the user has
    // to go through the SAML login process again.
    //
    // We assume that in most cases this should mean that they just get bounced
    // through Ping without needing to re-authenticate, since their SAML session
    // should still be active.
    request.yar.clear(SESSION_AUTH_KEY);
    return undefined;
  }

  return sessionAuth;
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

  save() {
    this.request.yar.set(LOGIN_SESSION_KEY, { ...this.loginSession });
  }

  sessionDebugInfo() {
    return {
      isAuthenticated: this.request.auth.isAuthenticated,
      hasLoginAuth: !!this.loginAuth,
      hasLoginSession: !!this.loginSession,
      hasForgotPasswordAuth: !!this.forgotPasswordAuth,
      sessionCookie: this.request.state['session'],
    };
  }
}
