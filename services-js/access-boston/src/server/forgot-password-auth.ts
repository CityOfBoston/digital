import { Server as HapiServer } from 'hapi';
import SamlAuth, { makeSamlAuth } from './services/SamlAuth';
import SamlAuthFake, { makeFakeLoginHandler } from './services/SamlAuthFake';
import { BrowserAuthOptions } from '@cityofboston/hapi-common';
import {
  getSessionAuth,
  setSessionAuth,
  CURRENT_SESSION_VERSION,
} from './Session';

const FORGOT_METADATA_PATH = '/metadata-forgot.xml';
const FORGOT_ASSERT_PATH = '/assert-forgot';
const FORGOT_REDIRECT_PATH = '/forgot-redirect';
const FAKE_FORGOT_LOGIN_FORM_PATH = '/fake-forgot-login-form';

interface Paths {
  forgotPath: string;
}

/**
 * Ten minutes in milliseconds. This corresponds to the MFA session lifetime.
 */
const FORGOT_PASSWORD_SESSION_LENGTH_MS = 10 * 60 * 1000;

/**
 * Adds routes and handling for the separate "forgot password" SAML app.
 *
 * Forgot password is treated differently from normal login because you only
 * auth with an MFA token. That difference means that the Ping configuration has
 * to separate it as a different app.
 *
 * We try to use a different everything from normal login to reduce the chances
 * that we "cross streams" and allow forgot password auth to authorize normal
 * login operations and vice-versa.
 */
export async function addForgotPasswordAuth(
  server: HapiServer,
  { forgotPath }: Paths
) {
  const authStrategyOptions: BrowserAuthOptions = {
    redirectTo: FORGOT_REDIRECT_PATH,

    validate: request => {
      const auth = getSessionAuth(request);

      if (
        auth &&
        auth.type === 'forgotPassword' &&
        // We hand-expire because Yar doesn’t give us a way to set the forgot
        // password sessions at a different duration from the others.
        Date.now() < (auth.createdTime || 0) + FORGOT_PASSWORD_SESSION_LENGTH_MS
      ) {
        return { credentials: { forgotPasswordAuth: auth } };
      } else {
        return null;
      }
    },
  };

  server.auth.strategy('forgot-password', 'browser', authStrategyOptions);

  // For the forgot password workflow, we use a separate SAML app because the
  // backend auth setup has to require the MFA at all times for these logins.
  let samlAuth: SamlAuth;

  if (
    process.env.NODE_ENV === 'production' ||
    process.env.SAML_IN_DEV === 'true'
  ) {
    const publicHost = process.env.PUBLIC_HOST;
    const metadataUrl = `https://${publicHost}${FORGOT_METADATA_PATH}`;
    const assertUrl = `https://${publicHost}${FORGOT_ASSERT_PATH}`;

    samlAuth = await makeSamlAuth(
      {
        metadataPath: './saml-forgot-metadata.xml',
        serviceProviderCertPath: './service-provider-forgot.crt',
        serviceProviderKeyPath: './service-provider-forgot.key',
      },
      {
        metadataUrl,
        assertUrl,
      },
      ''
    );
  } else {
    samlAuth = new SamlAuthFake({
      loginFormUrl: FAKE_FORGOT_LOGIN_FORM_PATH,
    }) as any;
  }

  server.route({
    path: FORGOT_METADATA_PATH,
    method: 'GET',
    options: { auth: false },
    handler: (_, h) =>
      h.response(samlAuth.getMetadata()).type('application/xml'),
  });

  // Same as above, just for the forgot password sessions.
  server.route({
    path: FORGOT_REDIRECT_PATH,
    method: 'GET',
    options: { auth: false },
    handler: async (_, h) => h.redirect(await samlAuth.makeLoginUrl()),
  });

  // Fake login forms we can use in dev without needing the SAML SSO
  // infrastructure configured.
  if (process.env.NODE_ENV !== 'production') {
    server.route({
      path: FAKE_FORGOT_LOGIN_FORM_PATH,
      method: 'GET',
      options: { auth: false },
      handler: makeFakeLoginHandler(
        FORGOT_ASSERT_PATH,
        process.env.SAML_FAKE_USER_ID || 'CON01234'
      ),
    });
  }

  server.route({
    path: FORGOT_ASSERT_PATH,
    method: 'POST',
    options: {
      auth: false,
      plugins: {
        crumb: false,
      },
    },
    handler: async (request, h) => {
      const assertResult = await samlAuth.handlePostAssert(
        request.payload as any
      );

      if (assertResult.type !== 'login') {
        throw new Error(
          `Unexpected assert result in POST handler: ${assertResult.type}`
        );
      }

      setSessionAuth(request, {
        type: 'forgotPassword',
        sessionVersion: CURRENT_SESSION_VERSION,
        userId: assertResult.nameId,
        resetPasswordToken: assertResult.userAccessToken,
        createdTime: Date.now(),
      });

      return h.redirect(forgotPath);
    },
  });

  server.route({
    path: FORGOT_ASSERT_PATH,
    method: 'GET',
    options: { auth: false },
    handler: async () => {
      throw new Error(`Unexpected GET request to ${FORGOT_ASSERT_PATH}`);
    },
  });
}
