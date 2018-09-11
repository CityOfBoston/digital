/* eslint no-console: 0 */

import {
  Server as HapiServer,
  Request as HapiRequest,
  RequestQuery,
} from 'hapi';

import SamlAuth, { makeSamlAuth } from './services/SamlAuth';
import SamlAuthFake from './services/SamlAuthFake';

import SessionAuth, { Session } from './SessionAuth';

const LOGIN_METADATA_PATH = '/metadata.xml';
const LOGIN_ASSERT_PATH = '/assert';
const FAKE_LOGIN_FORM_PATH = '/fake-login-form';
const LOGIN_COOKIE_AUTH_DECORATOR = 'loginCookieAuth';

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
  if (
    process.env.NODE_ENV === 'production' &&
    !process.env.LOGIN_COOKIE_PASSWORD
  ) {
    throw new Error('Must set $LOGIN_COOKIE_PASSWORD in production');
  }

  server.auth.strategy('login', 'cookie', {
    // Fallback password so this runs in dev / test w/o extra configuration.
    password:
      process.env.LOGIN_COOKIE_PASSWORD || 'iWIMwE69HJj9GQcHfCiu2TVyZoVxvYoU',
    cookie: 'lsid',
    redirectTo: loginPath,
    isSecure: process.env.NODE_ENV === 'production',
    ttl: 60 * 60 * 1000,
    clearInvalid: true,
    keepAlive: true,
    requestDecoratorName: LOGIN_COOKIE_AUTH_DECORATOR,
  });

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
      const sessionAuth = getLoginSessionAuth(request);
      const session = sessionAuth.get();

      // We clear our cookie when you hit this button, since it's better for us
      // to be logged out on AccessBoston but logged in on the SSO side than
      // the alternative.
      sessionAuth.clear();

      return h.redirect(
        await samlAuth.makeLogoutUrl(session.nameId, session.sessionIndex)
      );
    },
  });

  server.route({
    path: LOGIN_ASSERT_PATH,
    method: 'POST',
    options: {
      auth: false,
      plugins: {
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

      const sessionAuth = getLoginSessionAuth(request);
      sessionAuth.set({
        nameId,
        sessionIndex,
        groups,
      });

      // TODO(finh): Can we get a destination URL from the assertion, rather
      // than always go to the root?
      return h.redirect(afterLoginUrl);
    },
  });

  // Used in logout requests and development
  server.route({
    path: LOGIN_ASSERT_PATH,
    method: 'GET',
    // "try" because we want to look at the session if it's available, but
    // we don't want to redirect to login if you're trying to log out.
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

      const session: Session = (request.auth.credentials as any) || {};
      // Check to make sure this is the session we're getting rid of. We're
      // tolerant of the session being clear already (which happens if we’re the
      // ones who initiate logout)
      if (
        session.nameId === assertResult.nameId &&
        session.sessionIndex === assertResult.sessionIndex
      ) {
        (request as any)[LOGIN_COOKIE_AUTH_DECORATOR].clear();
        return h.redirect(assertResult.successUrl);
      } else {
        console.debug(`Logout name ID or session index doesn’t match session`);
        return h.redirect(afterLoginUrl);
      }
    },
  });
}

export function getLoginSessionAuth(request: HapiRequest): SessionAuth {
  return new SessionAuth(request, LOGIN_COOKIE_AUTH_DECORATOR);
}
