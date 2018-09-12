/* eslint no-console: 0 */

import fs from 'fs';
import path from 'path';

import { Server as HapiServer } from 'hapi';
import Crumb from 'crumb';
import yar from 'yar';
import cleanup from 'node-cleanup';
import acceptLanguagePlugin from 'hapi-accept-language2';
import next from 'next';

// https://github.com/apollographql/apollo-server/issues/927
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi');

import {
  API_KEY_CONFIG_KEY,
  GRAPHQL_PATH_KEY,
  HAPI_INJECT_CONFIG_KEY,
} from '@cityofboston/next-client-common';

import {
  loggingPlugin,
  adminOkRoute,
  headerKeysPlugin,
  browserAuthPlugin,
} from '@cityofboston/hapi-common';

import { makeRoutesForNextApp, makeNextHandler } from '@cityofboston/hapi-next';

import decryptEnv from '@cityofboston/srv-decrypt-env';

import graphqlSchema, { Context } from './graphql/schema';

import IdentityIq from './services/IdentityIq';
import IdentityIqFake from './services/IdentityIqFake';
import AppsRegistry, { makeAppsRegistry } from './services/AppsRegistry';

import { addLoginAuth, getLoginSession } from './login-auth';
import { addForgotPasswordAuth } from './forgot-password-auth';

const PATH_PREFIX = '';
const FORGOT_PASSWORD_PATH = '/forgot';

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

  const identityIq: IdentityIq =
    process.env.NODE_ENV === 'production' || process.env.IDENTITYIQ_URL
      ? new IdentityIq(
          process.env.IDENTITYIQ_URL,
          process.env.IDENTITYIQ_USERNAME,
          process.env.IDENTITYIQ_PASSWORD
        )
      : (new IdentityIqFake() as any);

  await server.register(acceptLanguagePlugin);
  await server.register(Crumb);

  if (
    process.env.NODE_ENV === 'production' &&
    !process.env.SESSION_COOKIE_PASSWORD
  ) {
    throw new Error('Must set $SESSION_COOKIE_PASSWORD in production');
  }

  // TODO(finh): Add Redis support for session storage
  await server.register({
    plugin: yar,
    options: {
      // Always stores everything in the cache, so we can clear out sessions
      // unilaterally rather than relying on cookie expiration and being
      // vulnerable to replays.
      maxCookieSize: 0,
      cookieOptions: {
        password:
          process.env.SESSION_COOKIE_PASSWORD ||
          'test-fake-key-iWIMwE69HJj9GQcHfCiu2TVyZoVxvYoU',
        isSecure: !dev,
        isHttpOnly: true,
      },
    },
  });

  await server.register(browserAuthPlugin);

  await addLoginAuth(server, {
    loginPath: '/login',
    logoutPath: '/logout',
    afterLoginUrl: '/',
  });

  await addForgotPasswordAuth(server, {
    forgotPath: FORGOT_PASSWORD_PATH,
  });

  // If the server is running in test mode we don't want the logs to pollute the
  // Jests output.
  if (process.env.NODE_ENV !== 'test') {
    await server.register(loggingPlugin);
  }

  server.route(adminOkRoute);

  await addGraphQl(server, appsRegistry, identityIq);

  // We don't turn on Next for test mode because it hangs Jest.
  if (process.env.NODE_ENV !== 'test') {
    await addNext(server);
  }

  return {
    server,
    startup: async () => {
      await server.start();

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

async function addGraphQl(
  server: HapiServer,
  appsRegistry: AppsRegistry,
  identityIq: IdentityIq
) {
  if (process.env.NODE_ENV === 'production' && !process.env.API_KEYS) {
    throw new Error('Must set $API_KEYS in production');
  }

  await server.register({
    plugin: headerKeysPlugin,
    options: {
      header: 'X-API-KEY',
      keys: process.env.API_KEYS ? process.env.API_KEYS.split(',') : [],
    },
  });

  await server.register({
    plugin: graphqlHapi,
    options: {
      path: `${PATH_PREFIX}/graphql`,
      route: {
        auth: {
          mode: 'try',
          strategies: ['login', 'forgot-password'],
        },
        plugins: {
          // We auth with a header, which can't be set via CSRF, so it's safe to
          // avoid checking the crumb cookie.
          crumb: false,
          headerKeys: !!process.env.API_KEYS,
        },
      },
      graphqlOptions: request => {
        const context: Context = {
          // We pass the credentials as separate elements of the context so that
          // type checking in the resolvers will ensure that we're doing
          // authorization. E.g. if loginAuth is undefined then the user isn't
          // logged in with that scheme. TypeScript won't let you pull values
          // off of "loginAuth" until you've ensured that it's defined.
          loginAuth: request.auth.credentials.loginAuth,
          forgotPasswordAuth: request.auth.credentials.forgotPasswordAuth,
          session: getLoginSession(request),
          appsRegistry,
          identityIq,
        };

        return {
          schema: graphqlSchema,
          context,
        };
      },
    },
  });

  await server.register({
    plugin: graphiqlHapi,
    options: {
      path: `${PATH_PREFIX}/graphiql`,
      route: {
        auth: false,
      },
      graphiqlOptions: {
        endpointURL: `${PATH_PREFIX}/graphql`,
        passHeader: `'X-API-KEY': '${process.env.WEB_API_KEY || ''}'`,
      },
    },
  });
}

async function addNext(server: HapiServer) {
  // We load the config ourselves so that we can modify the runtime configs
  // from here.
  const config = require('../../next.config.js');

  config.publicRuntimeConfig = {
    ...config.publicRuntimeConfig,
    [GRAPHQL_PATH_KEY]: '/graphql',
    [API_KEY_CONFIG_KEY]: process.env.WEB_API_KEY,
  };

  config.serverRuntimeConfig = {
    [HAPI_INJECT_CONFIG_KEY]: server.inject.bind(server),
    ...config.serverRuntimeConfig,
  };

  const nextApp = next({
    dev,
    dir: 'src',
    config,
  });

  // We have to manually add the CSRF token because the Next helpers
  // only work on raw http objects and don't write out Hapi’s "state"
  // cookies.
  const addCrumbCookie = (request, h) => {
    if (!request.state['crumb']) {
      const crumb = (server.plugins as any).crumb.generate(request, h);
      request.raw.res.setHeader('Set-Cookie', `crumb=${crumb};HttpOnly`);
    }

    return h.continue;
  };

  // We have a special Next handler for the /forgot route that uses the
  // "forgot-password" session auth rather than the default "login".
  server.route({
    method: ['GET', 'POST'],
    path: FORGOT_PASSWORD_PATH,
    options: {
      auth: 'forgot-password',
    },
    handler: makeNextHandler(nextApp),
  });

  server.route(
    makeRoutesForNextApp(
      nextApp,
      '/',
      {
        ext: {
          onPostAuth: {
            method: addCrumbCookie,
          },
        },
      },
      {
        // Keeps us from doing session stuff on the static routes.
        plugins: { yar: { skip: true } },
      }
    )
  );

  await nextApp.prepare();
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
