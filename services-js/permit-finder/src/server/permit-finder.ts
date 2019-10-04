/* eslint no-console: 0 */

import fs from 'fs';
import path from 'path';

import {
  Server as HapiServer,
  RequestQuery,
  ResponseToolkit,
  Request as HapiRequest,
} from 'hapi';
import Inert from 'inert';
import cleanup from 'node-cleanup';
import hapiDevErrors from 'hapi-dev-errors';
const next = require('next');
import { ApolloServer } from 'apollo-server-hapi';
import AWS from 'aws-sdk';

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
  headerKeys,
  HeaderKeysOptions,
  rollbarPlugin,
  HapiGraphqlContextFunction,
  rollbarErrorExtension,
} from '@cityofboston/hapi-common';

import { makeRoutesForNextApp } from '@cityofboston/hapi-next';

import decryptEnv from '@cityofboston/srv-decrypt-env';

import graphqlSchema, { Context } from './graphql/schema';
import PermitFiles from './services/PermitFiles';
import { PACKAGE_ROOT } from './util';

const PATH_PREFIX = '';

const dev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

export async function makeServer(port, rollbar: Rollbar) {
  const serverOptions = {
    host: '0.0.0.0',
    port,
    tls: undefined as any,
    debug: dev ? { request: ['error'] } : {},
  };

  if (process.env.USE_SSL) {
    serverOptions.tls = {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.crt'),
    };
  }

  const server = new HapiServer(serverOptions);

  await server.register(Inert);
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

  // If the server is running in test mode we don't want the logs to pollute the
  // Jests output.
  if (process.env.NODE_ENV !== 'test') {
    await server.register(loggingPlugin);
  }

  server.route(adminOkRoute);
  server.route(makeStaticAssetRoutes());

  const apiKeys: string[] = [];

  if (process.env.API_KEYS) {
    process.env.API_KEYS.split(',').forEach(k => {
      apiKeys.push(k);
    });
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('Must set $API_KEYS in production');
  }

  server.auth.scheme('headerKeys', headerKeys);
  server.auth.strategy('apiHeaderKeys', 'headerKeys', {
    header: 'X-API-KEY',
    keys: apiKeys,
  } as HeaderKeysOptions);

  const permitFiles = new PermitFiles();

  if (process.env.DATA_S3_BUCKET) {
    const bucket = process.env.DATA_S3_BUCKET;
    const s3 = new AWS.S3();

    await permitFiles.loadFromS3(s3, bucket);

    setInterval(async () => {
      try {
        await permitFiles.loadFromS3(s3, bucket);
      } catch (e) {
        rollbar.error(e);
      }
    }, 1000 * 60 * 5);
  } else {
    await permitFiles.loadFromDir(path.join(PACKAGE_ROOT, 'fixtures'));
  }

  const context: HapiGraphqlContextFunction<Context> = () => ({ permitFiles });

  const apolloServer = new ApolloServer({
    schema: graphqlSchema,
    context,
    extensions: [rollbarErrorExtension(rollbar)],
  });

  await apolloServer.applyMiddleware({
    app: server,
    route: {
      cors: true,
      auth:
        apiKeys.length || process.env.NODE_ENV == ('staging' as any)
          ? 'apiHeaderKeys'
          : false,
    },
  });

  // We don't turn on Next for test mode because it hangs Jest.
  if (process.env.NODE_ENV !== 'test') {
    await addNext(server);
  }

  // Redirects for old permitfinder.boston.gov paths, in case people have them
  // bookmarked.
  const redirectLegacyPath = (req: HapiRequest, h: ResponseToolkit) =>
    (req.query as RequestQuery).id
      ? h.redirect(
          `/permit?id=${encodeURIComponent(
            (req.query as RequestQuery).id.toString()
          )}`
        )
      : h.redirect('/');

  await server.route([
    { method: 'GET', path: '/details.html', handler: redirectLegacyPath },
    { method: 'GET', path: '/details_fire.html', handler: redirectLegacyPath },
  ]);

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
      return async () => {
        await server.stop();
        await permitFiles.destroy();
      };
    },
  };
}

async function addNext(server: HapiServer) {
  // We load the config ourselves so that we can modify the runtime configs
  // from here.
  const config = require('../../next.config.js');

  const externalAssetUrl = process.env.ASSET_HOST
    ? `https://${process.env.ASSET_HOST}/permit-finder`
    : undefined;

  config.publicRuntimeConfig = {
    ...config.publicRuntimeConfig,
    [GRAPHQL_PATH_KEY]: '/graphql',
    [API_KEY_CONFIG_KEY]: process.env.WEB_API_KEY,
    [GOOGLE_TRACKING_ID_KEY]: process.env.GOOGLE_TRACKING_ID,
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

  server.route(makeRoutesForNextApp(nextApp, '/', {}, {}, externalAssetUrl));

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
