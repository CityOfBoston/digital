/* eslint no-console: 0 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import fetch from 'node-fetch';

import { Server as HapiServer, ResponseObject, Lifecycle } from 'hapi';
import Inert from 'inert';
import Crumb from 'crumb';
import yar from 'yar';
import cleanup from 'node-cleanup';
import acceptLanguagePlugin from 'hapi-accept-language2';
import hapiDevErrors from 'hapi-dev-errors';
const next = require('next');
import { ApolloServer } from 'apollo-server-hapi';

import { parse, Compile } from 'velocityjs';
import { default as pingData } from './ping-templates/mockData';

import Rollbar from 'rollbar';

import {
  API_KEY_CONFIG_KEY,
  GRAPHQL_PATH_KEY,
  HAPI_INJECT_CONFIG_KEY,
  GOOGLE_TRACKING_ID_KEY,
} from '@cityofboston/next-client-common';

import {
  loggingPlugin,
  makeStaticAssetRoutes,
  adminOkRoute,
  headerKeysPlugin,
  browserAuthPlugin,
  rollbarPlugin,
  HapiGraphqlContextFunction,
  rollbarErrorExtension,
} from '@cityofboston/hapi-common';

import { makeRoutesForNextApp, makeNextHandler } from '@cityofboston/hapi-next';

import decryptEnv from '@cityofboston/srv-decrypt-env';

import graphqlSchema, { Context } from './graphql/schema';

import IdentityIq from './services/IdentityIq';
import IdentityIqFake from './services/IdentityIqFake';
import AppsRegistry, { makeAppsRegistry } from '../lib/AppsRegistry';

import { addLoginAuth } from './login-auth';
import { addForgotPasswordAuth } from './forgot-password-auth';
import Session from './Session';
import PingId, { pingIdFromProperties } from './services/PingId';
import PingIdFake from './services/PingIdFake';

require('dotenv').config();

const readFile = promisify(fs.readFile);

const PATH_PREFIX = '';
const FORGOT_PASSWORD_PATH = '/forgot';

const PINGID_PROPERTIES_FILE = 'pingid.properties';

const dev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

if (
  process.env.NODE_ENV === 'production' &&
  !process.env.HAPI_REDIS_CACHE_HOST
) {
  throw new Error('$HAPI_REDIS_CACHE_HOST is not defined');
}

export async function makeServer(port, rollbar: Rollbar) {
  const serverOptions = {
    host: '0.0.0.0',
    port,
    tls: undefined as any,
    state: {
      ignoreErrors: true,
    },
    cache: process.env.HAPI_REDIS_CACHE_HOST
      ? {
          engine: require('catbox-redis'),
          host: process.env.HAPI_REDIS_CACHE_HOST,
          port: parseInt(process.env.HAPI_REDIS_CACHE_PORT || '6379'),
          database: parseInt(process.env.HAPI_REDIS_CACHE_DATABASE || '0'),
          partition: `${process.env.DEPLOY_VARIANT}-`,
        }
      : undefined,

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
    ? makeAppsRegistry(await readFile('./apps.yaml', 'utf-8'))
    : makeAppsRegistry(
        await readFile(
          path.resolve(__dirname, '../../fixtures/apps.yaml'),
          'utf-8'
        ),
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

  const pingId: PingId =
    process.env.NODE_ENV === 'production' ||
    (dev && fs.existsSync(PINGID_PROPERTIES_FILE))
      ? await pingIdFromProperties(PINGID_PROPERTIES_FILE)
      : (new PingIdFake() as any);

  await server.register(acceptLanguagePlugin);
  await server.register(Inert);
  await server.register(Crumb);
  await server.register({ plugin: rollbarPlugin, options: { rollbar } });

  await server.register({
    plugin: hapiDevErrors,
    options: {
      // AWS_S3_CONFIG_URL is a hack to see if we’re running in staging, since
      // we don’t expose that as an env variable otherwise.
      showErrors:
        dev ||
        (process.env.NODE_ENV === 'production' &&
          (process.env.AWS_S3_CONFIG_URL || '').includes('staging')),
    },
  });

  if (
    process.env.NODE_ENV === 'production' &&
    !process.env.SESSION_COOKIE_PASSWORD
  ) {
    throw new Error('Must set $SESSION_COOKIE_PASSWORD in production');
  }

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
        isSecure: process.env.NODE_ENV === 'production',
        isHttpOnly: true,
        // If we happen to get POSTed to from the SAML provider we still want to
        // have our session available.
        isSameSite: false,
        // Timeout after 15 mins of inactivity; corresponds to Ping Federate
        // Session configuration
        ttl: 15 * 60 * 1000,
      },
    },
  });

  await server.register(browserAuthPlugin);

  await addLoginAuth(server, rollbar, {
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
  server.route(makeStaticAssetRoutes());

  await addGraphQl(server, appsRegistry, identityIq, pingId, rollbar);

  await addVelocityTemplates(server);

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
  identityIq: IdentityIq,
  pingId: PingId,
  rollbar: Rollbar
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

  const context: HapiGraphqlContextFunction<Context> = ({ request }) => ({
    session: new Session(request),
    appsRegistry,
    identityIq,
    pingId,
  });

  const apolloServer = new ApolloServer({
    schema: graphqlSchema,
    context,
    extensions: [rollbarErrorExtension(rollbar)],
  });

  await apolloServer.applyMiddleware({
    app: server,
    route: {
      auth: {
        // It’s the resolvers’ responsibility to throw Forbidden exceptions if
        // they’re trying to do something that needs authorization but it’s
        // not there.
        //
        // Since this is an API, it’s fine to send a Forbidden response,
        // there’s no need to 300 to a login page.
        mode: 'optional',
        strategies: ['login', 'forgot-password'],
      },
      plugins: {
        // We auth with a header, which can't be set via CSRF, so it's safe to
        // avoid checking the crumb cookie.
        crumb: false,
        headerKeys: !!process.env.API_KEYS,
      },
    },
  });
}

async function addVelocityTemplates(server: HapiServer) {
  server.route({
    path: '/ping/login',
    method: 'GET',
    options: {
      auth: false,
    },
    handler: () => {
      const template = fs.readFileSync(
        './src/server/ping-templates/html.form.login.template.html',
        'utf-8'
      );
      const asts = parse(template);

      return new Compile(asts, { escape: false }).render(pingData);
    },
  });

  server.route({
    path: '/ping/logout',
    method: 'GET',
    options: {
      auth: false,
    },
    handler: () => {
      const template = fs.readFileSync(
        './src/server/ping-templates/idp.logout.success.page.template.html',
        'utf-8'
      );
      const asts = parse(template);

      return new Compile(asts, { escape: false }).render(pingData);
    },
  });

  server.route({
    path: '/ping/change-password',
    method: 'GET',
    options: {
      auth: false,
    },
    handler: () => {
      const template = fs.readFileSync(
        './src/server/ping-templates/html.form.change.password.template.html',
        'utf-8'
      );
      const asts = parse(template);

      return new Compile(asts, { escape: false }).render(pingData);
    },
  });

  server.route({
    path: '/ping/general-error',
    method: 'GET',
    options: {
      auth: false,
    },
    handler: () => {
      const template = fs.readFileSync(
        './src/server/ping-templates/general.error.page.template.html',
        'utf-8'
      );
      const asts = parse(template);

      return new Compile(asts, { escape: false }).render(pingData);
    },
  });

  server.route({
    path: '/fetchGraphql',
    method: ['POST'],
    options: {
      auth: false,
      plugins: {
        crumb: false,
      },
    },
    handler: async _req => {
      const fetchQ = async this_req => {
        const query = this_req.payload.query;
        const variables = this_req.payload.variables;

        return await fetch(
          `${process.env.GROUP_MANAGEMENT_API_URL}` as string,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              token: `${process.env.GROUP_MGMT_API_KEY}` as string,
            },
            body: JSON.stringify({
              query,
              variables,
            }),
          }
        )
          .then(response => response.json())
          .then(response => response);
      };

      return await fetchQ(_req);
    },
  });
}

async function addNext(server: HapiServer) {
  // We load the config ourselves so that we can modify the runtime configs
  // from here.
  const config = require('../../next.config.js');

  const externalAssetUrl = process.env.ASSET_HOST
    ? `https://${process.env.ASSET_HOST}/access-boston`
    : undefined;

  config.publicRuntimeConfig = {
    ...config.publicRuntimeConfig,
    [GRAPHQL_PATH_KEY]: '/graphql',
    [API_KEY_CONFIG_KEY]: process.env.WEB_API_KEY,
    [GOOGLE_TRACKING_ID_KEY]: process.env.GOOGLE_TRACKING_ID,
    PING_HOST: process.env.PING_HOST,
  };

  config.serverRuntimeConfig = {
    [HAPI_INJECT_CONFIG_KEY]: server.inject.bind(server),
    ...config.serverRuntimeConfig,
  };

  const nextApp = next({
    dev,
    dir: 'src',
    conf: config,
  });

  // We have to manually add the CSRF token because the Next helpers
  // only work on raw http objects and don't write out Hapi’s "state"
  // cookies.
  const addCrumbCookie: Lifecycle.Method = (request, h) => {
    if (!request.state['crumb']) {
      const crumb = (server.plugins as any).crumb.generate(request, h);
      request.raw.res.setHeader('Set-Cookie', `crumb=${crumb};HttpOnly`);
    }

    return h.continue;
  };

  // Hapi’s default caching handling doesn’t support things like "no-store,"
  // which we want to ensure so that Firefox’s back/forward cache doesn’t
  // keep the page around after logout. (So you can’t "back" in to a logged-
  // in looking portal page after the session has expired.)
  const noCaching: Lifecycle.Method = (request, h) => {
    const response: ResponseObject | null = request.response as any;
    if (response && response.header) {
      response.header('cache-control', 'no-cache,no-store,max-age=0');
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
      ext: {
        onPostAuth: {
          method: addCrumbCookie,
        },
        onPreResponse: {
          method: noCaching,
        },
      },
    },
    handler: makeNextHandler(nextApp),
  });

  // The /done route is special because that's where we send people after
  // they’re done filling out their registration. It needs to clear the local
  // session so that the user is prompted to log in again.
  //
  // (The user is logged out of SAML during registration, we only have the local
  // session.)
  server.route({
    method: ['POST'],
    path: '/done',
    options: {
      ext: {
        onPostAuth: {
          method: addCrumbCookie,
        },
        onPreResponse: {
          method: noCaching,
        },
      },
    },
    handler: (nextHandler => (request, h) => {
      request.yar.reset();

      return nextHandler(request, h);
    })(makeNextHandler(nextApp)),
  });

  server.route({
    method: ['GET'],
    path: '/warptime',
    handler: () => {
      return `${process.env.GROUP_MANAGEMENT_API_URL}`;
    },
    options: {
      // mark this as a health check so that it doesn’t get logged
      tags: ['health'],
      auth: false,
    },
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
          onPreResponse: {
            method: noCaching,
          },
        },
      },
      {
        // Keeps us from doing session stuff on the static routes.
        plugins: { yar: { skip: true } },
      },
      externalAssetUrl
    )
  );

  await nextApp.prepare();
}

export default async function startServer(rollbar: Rollbar) {
  await decryptEnv();

  const port = parseInt(process.env.PORT || '3000', 10);

  const { startup } = await makeServer(port, rollbar);
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
        rollbar.error(err);
        console.log('CLEAN EXIT FAILED', err);
        process.exit(-1);
      }
    );

    cleanup.uninstall();
    return false;
  });
}
