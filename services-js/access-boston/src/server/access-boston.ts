/* eslint no-console: 0 */

import fs from 'fs';
import path from 'path';

import { Server as HapiServer, RequestQuery } from 'hapi';
import Crumb from 'crumb';
import cookieAuthPlugin from 'hapi-auth-cookie';

import cleanup from 'node-cleanup';
import acceptLanguagePlugin from 'hapi-accept-language2';
import next from 'next';

import { HAPI_INJECT_CONFIG_KEY } from '@cityofboston/next-client-common';

import { loggingPlugin, adminOkRoute } from '@cityofboston/hapi-common';

import { makeRoutesForNextApp } from '@cityofboston/hapi-next';

import decryptEnv from '@cityofboston/srv-decrypt-env';
import SamlAuth, { makeSamlAuth } from './SamlAuth';

import { Session, infoForUser } from './api';
import SamlAuthFake from './SamlAuthFake';
import { makeAppsRegistry } from './AppsRegistry';

const PATH_PREFIX = '/';
const METADATA_PATH = '/metadata.xml';
const ASSERT_PATH = '/assert';

const dev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

export async function makeServer(port) {
  const serverOptions = {
    host: '0.0.0.0',
    port,
    tls: undefined as any,
    router: {
      stripTrailingSlash: true,
    },
    debug:
      // eslint-disable-next-line
      dev || true
        ? {
            request: ['error'],
          }
        : {},
  };

  if (process.env.USE_SSL) {
    serverOptions.tls = {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.crt'),
    };
  }

  const server = new HapiServer(serverOptions);

  const appsRegistry = await (process.env.NODE_ENV === 'production' ||
  (dev && fs.existsSync('./apps.yaml'))
    ? makeAppsRegistry('./apps.yaml')
    : makeAppsRegistry(
        path.resolve(__dirname, '../../fixtures/apps.yaml'),
        process.env.NODE_ENV !== 'test'
      ));

  const samlAuth: SamlAuth =
    process.env.NODE_ENV === 'production' || process.env.SAML_IN_DEV
      ? await makeSamlAuth(
          {
            metadataPath: './saml-metadata.xml',
            serviceProviderCertPath: './service-provider.crt',
            serviceProviderKeyPath: './service-provider.key',
          },
          {
            metadataUrl: `https://${process.env.PUBLIC_HOST}${METADATA_PATH}`,
            assertUrl: `https://${process.env.PUBLIC_HOST}${ASSERT_PATH}`,
          },
          process.env.SINGLE_LOGOUT_URL || ''
        )
      : (new SamlAuthFake(ASSERT_PATH) as any);

  // We don't turn on Next for test mode because it hangs Jest.
  let nextApp;

  if (process.env.NODE_ENV !== 'test') {
    // We load the config ourselves so that we can modify the runtime configs
    // from here.
    const config = require('../../next.config.js');

    config.publicRuntimeConfig = {
      ...config.publicRuntimeConfig,
    };

    config.serverRuntimeConfig = {
      [HAPI_INJECT_CONFIG_KEY]: server.inject.bind(server),
      ...config.serverRuntimeConfig,
    };

    nextApp = next({
      dev,
      dir: 'src',
      config,
    });
  } else {
    nextApp = null;
  }

  await server.register(acceptLanguagePlugin);
  await server.register(cookieAuthPlugin);
  await server.register(Crumb);

  // We start up the server in test, and we don’t want it logging.
  if (process.env.NODE_ENV !== 'test') {
    await server.register(loggingPlugin);
  }

  if (
    process.env.NODE_ENV === 'production' &&
    !process.env.SESSION_COOKIE_PASSWORD
  ) {
    throw new Error('Must set $SESSION_COOKIE_PASSWORD in production');
  }

  const cookiePassword =
    process.env.SESSION_COOKIE_PASSWORD || 'iWIMwE69HJj9GQcHfCiu2TVyZoVxvYoU';

  server.auth.strategy('session', 'cookie', {
    password: cookiePassword,
    cookie: 'sid',
    redirectTo: '/login',
    isSecure: process.env.NODE_ENV === 'production',
    ttl: 60 * 60 * 1000,
    keepAlive: true,
  });

  server.auth.default('session');

  server.route(adminOkRoute);

  server.route({
    path: METADATA_PATH,
    method: 'GET',
    options: {
      auth: false,
    },
    handler: (_, h) =>
      h.response(samlAuth.getMetadata()).type('application/xml'),
  });

  server.route({
    path: '/login',
    method: 'GET',
    options: {
      auth: { mode: 'try' },
      plugins: { 'hapi-auth-cookie': { redirectTo: false } },
    },
    handler: async (_, h) => h.redirect(await samlAuth.makeLoginUrl()),
  });

  if (process.env.NODE_ENV !== 'production') {
    server.route({
      path: '/login-form',
      method: 'GET',
      options: {
        auth: false,
      },
      handler: () =>
        `<form action="/assert" method="POST"><input type="submit" value="Log In" /></form>`,
    });
  }

  server.route({
    path: '/logout',
    method: 'POST',
    handler: async (request, h) => {
      const session: Session = request.auth.credentials as any;

      // We clear our cookie when you hit this button, since it's better for us
      // to be logged out on AccessBoston but logged in on the SSO side than
      // the alternative.
      (request as any).cookieAuth.clear();

      return h.redirect(
        await samlAuth.makeLogoutUrl(session.nameId, session.sessionIndex)
      );
    },
  });

  server.route({
    path: '/info',
    method: 'GET',
    handler: async (request, h) => {
      const session: Session = request.auth.credentials as any;
      return h.response(await infoForUser(appsRegistry, session));
    },
  });

  server.route({
    path: ASSERT_PATH,
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

      const session: Session = {
        nameId,
        sessionIndex,
        groups,
      };

      (request as any).cookieAuth.set(session);
      return h.redirect('/');
    },
  });

  // Used in logout requests and development
  server.route({
    path: ASSERT_PATH,
    method: 'GET',
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
        (session.nameId && session.nameId !== assertResult.nameId) ||
        (session.sessionIndex &&
          session.sessionIndex !== assertResult.sessionIndex)
      ) {
        console.debug(`Logout name ID or session index doesn’t match session`);
        return h.redirect('/');
      } else {
        (request as any).cookieAuth.clear();
        return h.redirect(assertResult.successUrl);
      }
    },
  });

  if (nextApp) {
    server.route(
      makeRoutesForNextApp(nextApp, '/', {
        ext: {
          onPostAuth: {
            // We have to manually add the CSRF token because the Next helpers
            // only work on raw http objects and don't write out Hapi’s "state"
            // cookies.
            method: (request, h) => {
              if (!request.state['crumb']) {
                const crumb = (server.plugins as any).crumb.generate(
                  request,
                  h
                );
                request.raw.res.setHeader(
                  'Set-Cookie',
                  `crumb=${crumb};HttpOnly`
                );
              }

              return h.continue;
            },
          },
        },
      })
    );
  }

  return {
    server,
    startup: async () => {
      await Promise.all([server.start(), nextApp ? nextApp.prepare() : null]);

      console.log(
        `> Ready on http${
          process.env.USE_SSL ? 's' : ''
        }://localhost:${port}${PATH_PREFIX}`
      );

      // Add more shutdown code here.
      return () => Promise.all([server.stop()]);
    },
  };
}

export default async function startServer() {
  await decryptEnv();

  const port = parseInt(process.env.PORT || '3000', 10);

  const { startup } = await makeServer(port);
  const shutdown = await startup();

  // tsc-watch sends SIGUSR2 when it’s time to restart. That’s not caught by
  // cleanup, so we get it ourselves so we can do a clean shutdown.
  process.on('SIGUSR2', () => {
    // Keeps us alive
    process.stdin.resume();

    // This will cause cleanup to run below
    process.kill(process.pid, 'SIGINT');
  });

  cleanup(exitCode => {
    shutdown().then(
      () => {
        process.exit(exitCode);
      },
      err => {
        console.log('CLEAN EXIT FAILED', err);
        process.exit(-1);
      }
    );

    cleanup.uninstall();
    return false;
  });
}
