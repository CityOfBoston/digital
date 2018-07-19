/* eslint no-console: 0 */

import fs from 'fs';

import { Server as HapiServer } from 'hapi';
import Boom from 'boom';
import cleanup from 'node-cleanup';
import acceptLanguagePlugin from 'hapi-accept-language2';
import next from 'next';
import { IdentityProvider, ServiceProvider } from 'saml2-js';

import {
  loggingPlugin,
  adminOkRoute,
} from '../../../../modules-js/hapi-common/build/hapi-common';

import { makeRoutesForNextApp } from '../../../../modules-js/hapi-next/build/hapi-next';

import decryptEnv from '../../../../modules-js/srv-decrypt-env/build/srv-decrypt-env';
import { loadSamlConfiguration } from './saml-configuration';

const PATH_PREFIX = '/';
const METADATA_PATH = '/metadata.xml';
const ASSERT_PATH = '/assert';

const dev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

type SamlAssertion = {
  response_header: {
    version: '2.0';
    destination: string;
    in_response_to: string;
    id: string;
  };
  type: 'authn_response';
  user: {
    name_id: string;
    session_index: string;
    attributes: object;
  };
};

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
          request: ['handler'],
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

  const samlConfig =
    process.env.NODE_ENV === 'test'
      ? { signRequests: false, loginUrl: '', logoutUrl: '', certificates: [] }
      : await loadSamlConfiguration('./saml-metadata.xml');

  const serviceProviderOpts = {
    entity_id: `https://${process.env.PUBLIC_HOST}${METADATA_PATH}`,
    private_key:
      process.env.NODE_ENV === 'test'
        ? ''
        : fs.readFileSync('service-provider.key').toString(),
    certificate:
      process.env.NODE_ENV === 'test'
        ? ''
        : fs.readFileSync('service-provider.crt').toString(),
    assert_endpoint: `https://${process.env.PUBLIC_HOST}${ASSERT_PATH}`,
    sign_get_request: samlConfig.signRequests,
    allow_unencrypted_assertion: true,
  };

  const identityProviderOpts = {
    sso_login_url: samlConfig.loginUrl,
    sso_logout_url: samlConfig.logoutUrl,
    certificates: samlConfig.certificates,
  };

  const serviceProvider = new ServiceProvider(serviceProviderOpts);
  const identityProvider = new IdentityProvider(identityProviderOpts);

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

  // We start up the server in test, and we don’t want it logging.
  if (process.env.NODE_ENV !== 'test') {
    await server.register(loggingPlugin);
  }

  server.route(adminOkRoute);

  server.route({
    path: METADATA_PATH,
    method: 'GET',
    handler: (_, h) =>
      h.response(serviceProvider.create_metadata()).type('application/xml'),
  });

  server.route({
    path: '/login',
    method: 'GET',
    handler: (_, h) =>
      new Promise((resolve, reject) => {
        serviceProvider.create_login_request_url(
          identityProvider,
          {},
          (err, loginUrl) => {
            if (err) {
              return reject(err);
            }

            resolve(h.redirect(loginUrl));
          }
        );
      }),
  });

  server.route({
    path: ASSERT_PATH,
    method: 'POST',
    handler: req =>
      new Promise((resolve, reject) => {
        serviceProvider.post_assert(
          identityProvider,
          { request_body: req.payload },
          (err, saml: SamlAssertion) => {
            if (err) {
              return reject(Boom.badRequest(err.toString()));
            }

            resolve(saml.user.name_id);
          }
        );
      }),
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
