/* eslint no-console: 0 */

import fs from 'fs';

import { Server as HapiServer } from 'hapi';
import cookieAuthPlugin from 'hapi-auth-cookie';

import cleanup from 'node-cleanup';
import acceptLanguagePlugin from 'hapi-accept-language2';
import next from 'next';

import { HAPI_INJECT_CONFIG_KEY } from '@cityofboston/next-client-common';

import { loggingPlugin, adminOkRoute } from '@cityofboston/hapi-common';

import { makeRoutesForNextApp } from '@cityofboston/hapi-next';

import decryptEnv from '@cityofboston/srv-decrypt-env';
import SamlAuth, { makeSamlAuth } from './SamlAuth';

import { InfoResponse } from '../lib/api';
import { Session } from './api';
import SamlAuthFake from './SamlAuthFake';

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
    debug: dev
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
          }
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

  server.route({
    path: '/logout',
    method: 'GET',
    handler: async (request, h) => {
      const session: Session = request.auth.credentials as any;

      return h.redirect(
        await samlAuth.makeLogoutUrl(session.nameId, session.sessionIndex)
      );
    },
  });

  server.route({
    path: '/info',
    method: 'GET',
    handler: (request, h) => {
      const session: Session = request.auth.credentials as any;

      const info: InfoResponse = {
        name: session.nameId,
      };

      return h.response(info);
    },
  });

  server.route({
    path: ASSERT_PATH,
    // 'GET' is only useful for dev
    method: ['POST', 'GET'],
    options: {
      auth: false,
    },
    handler: async (request, h) => {
      const { nameId, sessionIndex } = await samlAuth.handlePostAssert(
        request.payload as string
      );

      const session: Session = {
        nameId,
        sessionIndex,
      };

      (request as any).cookieAuth.set(session);
      return h.redirect('/');
    },
  });

  if (nextApp) {
    server.route(makeRoutesForNextApp(nextApp, '/'));
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
