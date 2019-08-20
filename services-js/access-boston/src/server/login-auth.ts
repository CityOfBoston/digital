import {
  Server as HapiServer,
  RequestQuery,
  ResponseToolkit,
  Request as HapiRequest,
} from 'hapi';

import moment from 'moment-timezone';

import Rollbar from 'rollbar';

import SamlAuth, {
  makeSamlAuth,
  SamlLogoutRequestResult,
  SamlRequestPostBody,
} from './services/SamlAuth';

import SamlAuthFake, { makeFakeLoginHandler } from './services/SamlAuthFake';

import {
  LoginSession,
  LoginAuth,
  setSessionAuth,
  getSessionAuth,
  LOGIN_SESSION_KEY,
  CURRENT_SESSION_VERSION,
} from './Session';

import { BrowserAuthOptions } from '@cityofboston/hapi-common';

const LOGIN_METADATA_PATH = '/metadata.xml';
const LOGIN_ASSERT_PATH = '/assert';
const FAKE_LOGIN_FORM_PATH = '/fake-login-form';

interface Paths {
  loginPath: string;
  logoutPath: string;
  afterLoginUrl: string;
}

// Timeout after 8 hours; corresponds to Ping Federate Session configuration
const MAX_TIMEOUT_LENGTH_MS = 480 * 60 * 1000;

/**
 * Creates the SAML auth for the normal, login flow and adds it to the server.
 * Includes handlers for redirecting to the SAML SSO endpoint and handling its
 * responses.
 */
export async function addLoginAuth(
  server: HapiServer,
  rollbar: Rollbar,
  { loginPath, logoutPath, afterLoginUrl }: Paths
) {
  const authStrategyOptions: BrowserAuthOptions = {
    redirectTo: loginPath,

    validate: request => {
      const auth = getSessionAuth(request, true);

      if (
        auth &&
        auth.type === 'login' &&
        // Adapted from forgot-password-auth.ts
        Date.now() < (auth.createdTime || 0) + MAX_TIMEOUT_LENGTH_MS
      ) {
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
      process.env.PING_HOST
        ? `https://${process.env.PING_HOST}/idp/SLO.saml2`
        : ''
    );
  } else {
    samlAuth = new SamlAuthFake({
      loginFormUrl: FAKE_LOGIN_FORM_PATH,
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
      handler: makeFakeLoginHandler(
        LOGIN_ASSERT_PATH,
        process.env.SAML_FAKE_USER_ID || 'CON01234'
      ),
    });
  }

  server.route({
    path: logoutPath,
    method: 'POST',
    options: {
      plugins: {
        crumb: false,
      },
    },
    handler: (request, h) => {
      // We clear our cookie and stored session when you hit this button, since
      // it's better for us to be logged out on AccessBoston but logged in on
      // the SSO side than the alternative.
      request.yar.reset();

      // We redirect to this URL and Ping takes over all of the single log-out.
      return h.redirect(process.env.SINGLE_LOGOUT_URL || '/');
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
        request.payload as any
      );
      // eslint-disable-next-line no-console
      // console.log('login-auth assertResult: ', assertResult);

      if (assertResult.type === 'login') {
        const {
          nameId,
          sessionIndex,
          firstName,
          lastName,
          email,
          groups,
          needsMfaDevice,
          needsNewPassword,
          hasMfaDevice,
          userMfaRegistrationDate,
          cobAgency,
        } = assertResult;

        // This will be read by the validate method above when doing authentication.
        const loginAuth: LoginAuth = {
          type: 'login',
          sessionVersion: CURRENT_SESSION_VERSION,
          userId: nameId,
          sessionIndex,
          createdTime: Date.now(),
        };

        setSessionAuth(request, loginAuth);

        let mfaRequiredDate: string | null = null;

        if (userMfaRegistrationDate) {
          // We’ve seen some values for this not parsing. We catch the error so
          // that it doesn’t fail the entire login process, but we send it to
          // Rollbar so we can tell the IAM team they should correct it.
          //
          // We explicitly use New York as the timezone to avoid the "midnight
          // GMT is the day before in Eastern time" problem.
          try {
            mfaRequiredDate = moment
              .tz(new Date(userMfaRegistrationDate), 'America/New_York')
              .toISOString();
          } catch (e) {
            rollbar.error(e, {
              extra: { userId: nameId, userMfaRegistrationDate },
            });
          }
        }

        const session: LoginSession = {
          type: 'login',
          firstName,
          lastName,
          email,
          groups,
          needsNewPassword,
          needsMfaDevice,
          hasMfaDevice,
          mfaSessionId: null,
          mfaEmail: null,
          mfaPhoneNumber: null,
          // We normalize to an ISO formatted string but need to keep this a
          // string because we’re serializing in Redis.
          mfaRequiredDate,
          cobAgency,
        };

        request.yar.set(LOGIN_SESSION_KEY, session);

        // TODO(finh): Can we get a destination URL from the assertion, rather
        // than always go to the root?
        return h.redirect(afterLoginUrl);
      } else if (assertResult.type === 'logout') {
        const samlRequest = request.payload as SamlRequestPostBody;
        return handleLogoutRequest(
          request,
          h,
          assertResult,
          samlRequest.RelayState
        );
      } else {
        throw new Error(`Unexpected assert result in POST handler`);
      }
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
      const query = request.query as RequestQuery;

      const assertResult = await samlAuth.handleGetAssert(query);

      if (assertResult.type !== 'logout') {
        throw new Error(
          `Unexpected assert result in GET handler: ${assertResult.type}`
        );
      }

      return handleLogoutRequest(
        request,
        h,
        assertResult,
        query.RelayState as string
      );
    },
  });

  async function handleLogoutRequest(
    request: HapiRequest,
    h: ResponseToolkit,
    assertResult: SamlLogoutRequestResult,
    relayState: string
  ) {
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
    }
    // We always go back to the SAML provider regardless of whether we cleared
    // our own session. Distributed client state is fun.
    return h.redirect(
      await samlAuth.makeLogoutSuccessUrl(assertResult.requestId, relayState)
    );
  }
}
