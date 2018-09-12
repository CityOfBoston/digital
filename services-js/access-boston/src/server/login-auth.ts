/* eslint no-console: 0 */

import {
  Server as HapiServer,
  Request as HapiRequest,
  RequestQuery,
} from 'hapi';

import SamlAuth, { makeSamlAuth } from './services/SamlAuth';
import SamlAuthFake from './services/SamlAuthFake';

import {
  LoginSession,
  LoginAuth,
  setSessionAuth,
  getSessionAuth,
  LOGIN_SESSION_KEY,
} from './sessions';

import { BrowserAuthOptions } from '@cityofboston/hapi-common';

const LOGIN_METADATA_PATH = '/metadata.xml';
const LOGIN_ASSERT_PATH = '/assert';
const FAKE_LOGIN_FORM_PATH = '/fake-login-form';

interface Paths {
  loginPath: string;
  logoutPath: string;
  afterLoginUrl: string;
}

/**
 * Creates the SAML auth for the normal, login flow and adds it to the server.
 * Includes handlers for redirecting to the SAML SSO endpoint and handling its
 * responses.
 */
export async function addLoginAuth(
  server: HapiServer,
  { loginPath, logoutPath, afterLoginUrl }: Paths
) {
  const authStrategyOptions: BrowserAuthOptions = {
    redirectTo: loginPath,

    validate: request => {
      const auth = getSessionAuth(request, true);

      if (auth && auth.type === 'login') {
        return { credentials: { loginAuth: auth } };
      } else {
        return null;
      }
    },
  };

  server.auth.strategy('login', 'browser', authStrategyOptions);
  server.auth.default('login');

  let samlAuth: SamlAuth;
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.SAML_IN_DEV === 'true'
  ) {
    const publicHost = process.env.PUBLIC_HOST;
    const metadataUrl = `https://${publicHost}${LOGIN_METADATA_PATH}`;
    const assertUrl = `https://${publicHost}${LOGIN_ASSERT_PATH}`;

    samlAuth = await makeSamlAuth(
      {
        metadataPath: './saml-metadata.xml',
        serviceProviderCertPath: './service-provider.crt',
        serviceProviderKeyPath: './service-provider.key',
      },
      {
        metadataUrl,
        assertUrl,
      },
      process.env.SINGLE_LOGOUT_URL || ''
    );
  } else {
    samlAuth = new SamlAuthFake({
      assertUrl: LOGIN_ASSERT_PATH,
      loginFormUrl: FAKE_LOGIN_FORM_PATH,
      userId: process.env.SAML_FAKE_USER_ID,
    }) as any;
  }

  server.route({
    path: LOGIN_METADATA_PATH,
    method: 'GET',
    options: { auth: false },
    handler: (_, h) =>
      h.response(samlAuth.getMetadata()).type('application/xml'),
  });

  // Our cookie auth strategy will redirect here, and this will redirect over to
  // SAML to complete the SSO login flow.
  server.route({
    path: loginPath,
    method: 'GET',
    options: { auth: false },
    handler: async (_, h) => h.redirect(await samlAuth.makeLoginUrl()),
  });

  // Fake login forms we can use in dev without needing the SAML SSO
  // infrastructure configured.
  if (process.env.NODE_ENV !== 'production') {
    server.route({
      path: FAKE_LOGIN_FORM_PATH,
      method: 'GET',
      options: {
        auth: false,
      },
      handler: () =>
        `<form action="${LOGIN_ASSERT_PATH}" method="POST">
          <input type="submit" value="Log In" />
        </form>`,
    });
  }

  server.route({
    path: logoutPath,
    method: 'POST',
    handler: async (request, h) => {
      // We clear our cookie and stored session when you hit this button, since
      // it's better for us to be logged out on AccessBoston but logged in on
      // the SSO side than the alternative.
      request.yar.reset();

      // We know loginAuth will be defined because this request is
      // authenticated.
      const { userId, sessionIndex } = request.auth.credentials.loginAuth!;
      return h.redirect(await samlAuth.makeLogoutUrl(userId, sessionIndex));
    },
  });

  // SAML POST assertions are typically log in results.
  server.route({
    path: LOGIN_ASSERT_PATH,
    method: 'POST',
    options: {
      auth: false,
      plugins: {
        // Have to disable XSRF checking since the SAML SSO can't provide it.
        // The assert signing serves as an XSRF check.
        crumb: false,
      },
    },
    handler: async (request, h) => {
      const assertResult = await samlAuth.handlePostAssert(
        request.payload as string
      );

      if (assertResult.type !== 'login') {
        throw new Error(
          `Unexpected assert result in POST handler: ${assertResult.type}`
        );
      }

      const { nameId, sessionIndex, groups } = assertResult;

      // This will be read by the validate method above when doing authentication.
      const loginAuth: LoginAuth = {
        type: 'login',
        userId: nameId,
        sessionIndex,
      };

      setSessionAuth(request, loginAuth);

      const session: LoginSession = {
        type: 'login',
        groups,
      };

      request.yar.set(LOGIN_SESSION_KEY, session);

      // TODO(finh): Can we get a destination URL from the assertion, rather
      // than always go to the root?
      return h.redirect(afterLoginUrl);
    },
  });

  // Used in logout requests
  server.route({
    path: LOGIN_ASSERT_PATH,
    method: 'GET',
    // "try" because we need to see the user ID and session index if they're
    // available in the auth, but if they're not there we don't want to redirect
    // to the login URL, which is what would happen if this was left as
    // "required."
    options: { auth: { mode: 'try' } },
    handler: async (request, h) => {
      const assertResult = await samlAuth.handleGetAssert(
        request.query as RequestQuery
      );

      if (assertResult.type !== 'logout') {
        throw new Error(
          `Unexpected assert result in GET handler: ${assertResult.type}`
        );
      }

      const loginAuth =
        request.auth.credentials && request.auth.credentials.loginAuth;

      // Check to make sure this is the session we're getting rid of. We're
      // tolerant of the session being clear already (which happens if we’re the
      // ones who initiate logout)
      if (
        loginAuth &&
        loginAuth.userId === assertResult.nameId &&
        loginAuth.sessionIndex === assertResult.sessionIndex
      ) {
        request.yar.reset();
      } else {
        console.debug(`Logout name ID or session index doesn’t match session`);
      }

      // We always go back to the SAML provider regardless of whether we cleared
      // our own session. Distributed client state is fun.
      return h.redirect(assertResult.successUrl);
    },
  });
}

export function getLoginSession(request: HapiRequest): LoginSession {
  return request.yar.get(LOGIN_SESSION_KEY);
}
