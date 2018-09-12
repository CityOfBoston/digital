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
