/* eslint no-console: 0 */

import fs from 'fs';

import { Server as HapiServer } from 'hapi';
import { boomify } from 'boom';
import Inert from 'inert';
import cleanup from 'node-cleanup';
import acceptLanguagePlugin from 'hapi-accept-language2';
const next = require('next');
import Rollbar from 'rollbar';
import { Client as PostmarkClient } from 'postmark';
import { ApolloServer } from 'apollo-server-hapi';

import {
  API_KEY_CONFIG_KEY,
  GRAPHQL_PATH_KEY,
  HAPI_INJECT_CONFIG_KEY,
  GOOGLE_TRACKING_ID_KEY,
} from '@cityofboston/next-client-common';

import {
  loggingPlugin,
  adminOkRoute,
  headerKeys,
  HeaderKeysOptions,
  rollbarPlugin,
  makeStaticAssetRoutes,
  HapiGraphqlContextFunction,
  rollbarErrorExtension,
} from '@cityofboston/hapi-common';

import { makeRoutesForNextApp } from '@cityofboston/hapi-next';

import { createConnectionPool } from '@cityofboston/mssql-common';
import decryptEnv from '@cityofboston/srv-decrypt-env';

import graphqlSchema, { Context } from './graphql/schema';
import CommissionsDao, { DbBoard } from './dao/CommissionsDao';
import CommissionsDaoFake from './dao/CommissionsDaoFake';
import { ConnectionPool } from 'mssql';
import { applyFormSchema, ApplyFormValues } from '../lib/validationSchema';

import Email from './services/Email';

const PATH_PREFIX = '/commissions';
const dev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

export async function makeServer(port, rollbar: Rollbar) {
  let makeCommissionsDao: () => CommissionsDao;
  let commissionsDbPool: ConnectionPool | null = null;

  const postmarkClient = new PostmarkClient(
    process.env.POSTMARK_SERVER_API_TOKEN || 'fake-postmark-key'
  );

  const emailService = new Email(
    process.env.POSTMARK_FROM_ADDRESS || 'no-reply@boston.gov',
    process.env.POLICY_OFFICE_TO_ADDRESS || 'boardsandcommissions@boston.gov',
    process.env.COMMISSIONS_URI ||
      'http://zpappweb01/cityclerk/commissions/applications',
    postmarkClient,
    rollbar
  );

  if (
    process.env.ALLOW_FAKES ||
    process.env.NODE_ENV === 'test' ||
    (process.env.NODE_ENV !== 'production' &&
      !process.env.COMMISSIONS_DB_SERVER)
  ) {
    makeCommissionsDao = () => new CommissionsDaoFake() as any;
  } else {
    const username = process.env.COMMISSIONS_DB_USERNAME;
    const password = process.env.COMMISSIONS_DB_PASSWORD;
    const database = process.env.COMMISSIONS_DB_DATABASE;
    const domain = process.env.COMMISSIONS_DB_DOMAIN;
    const serverName = process.env.COMMISSIONS_DB_SERVER;

    if (!username) {
      throw new Error('Must specify COMMISSIONS_DB_USERNAME');
    }

    if (!password) {
      throw new Error('Must specify COMMISSIONS_DB_PASSWORD');
    }

    if (!database) {
      throw new Error('Must specify COMMISSIONS_DB_DATABASE');
    }

    if (!serverName) {
      throw new Error('Must specify COMMISSIONS_DB_SERVER');
    }

    commissionsDbPool = await createConnectionPool(
      {
        username,
        password,
        database,
        domain,
        server: serverName,
      },
      err => {
        console.error(err);
        rollbar.error(err);
        process.exit(-1);
      }
    );

    makeCommissionsDao = () => new CommissionsDao(commissionsDbPool!);
  }

  const serverOptions = {
    host: '0.0.0.0',
    port,
    tls: undefined as any,
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

  // We don't turn on Next for test mode because it hangs Jest.
  let nextApp;

  if (process.env.NODE_ENV !== 'test') {
    // We load the config ourselves so that we can modify the runtime configs
    // from here.
    const config = require('../../next.config.js');

    config.publicRuntimeConfig = {
      ...config.publicRuntimeConfig,
      [GRAPHQL_PATH_KEY]: '/commissions/graphql',
      [API_KEY_CONFIG_KEY]: process.env.WEB_API_KEY,
      [GOOGLE_TRACKING_ID_KEY]: process.env.GOOGLE_TRACKING_ID,
    };

    config.serverRuntimeConfig = {
      ...config.serverRuntimeConfig,
      [HAPI_INJECT_CONFIG_KEY]: server.inject.bind(server),
    };

    nextApp = next({
      dev,
      dir: 'src',
      conf: config,
    });
  } else {
    nextApp = null;
  }

  server.auth.scheme('headerKeys', headerKeys);
  server.auth.strategy('apiHeaderKeys', 'headerKeys', {
    header: 'X-API-KEY',
    keys: process.env.API_KEYS ? process.env.API_KEYS.split(',') : [],
  } as HeaderKeysOptions);

  await server.register(acceptLanguagePlugin);
  await server.register({ plugin: rollbarPlugin, options: { rollbar } });
  await server.register(Inert);

  // We start up the server in test, and we don’t want it logging.
  if (process.env.NODE_ENV !== 'test') {
    await server.register(loggingPlugin);
  }

  server.route({
    method: 'GET',
    path: '/commissions',
    handler: (_, h) => h.redirect('/commissions/apply'),
  });

  server.route({
    method: 'POST',
    path: '/commissions/submit',
    options: {
      payload: {
        // Two 5mb files in bytes, plus another 500k for other form information.
        maxBytes: 1024 * 1024 * (2 * 5 + 0.5),
      },
    },
    handler: async (req, h) => {
      console.info('IN SUBMIT HANDLER');
      let validForm: ApplyFormValues;
      let fetchedBoards: DbBoard[];
      let applicationId: number;

      try {
        validForm = await applyFormSchema.validate(req.payload as any);
        fetchedBoards = await makeCommissionsDao().fetchBoards();
      } catch (e) {
        throw boomify(e, { statusCode: 400 });
      }

      applicationId = await makeCommissionsDao().apply(validForm);

      await emailService.sendConfirmations(
        validForm,
        fetchedBoards,
        applicationId
      );

      return h.response('ok');
    },
  });

  server.route(adminOkRoute);
  server.route(makeStaticAssetRoutes('/commissions/'));

  if (nextApp) {
    server.route(makeRoutesForNextApp(nextApp, '/commissions/'));
  }

  const context: HapiGraphqlContextFunction<Context> = () => ({
    commissionsDao: makeCommissionsDao(),
  });

  const apolloServer = new ApolloServer({
    context,
    schema: graphqlSchema,
    extensions: [rollbarErrorExtension(rollbar)],
  });

  await apolloServer.applyMiddleware({
    app: server,
    path: PATH_PREFIX + '/graphql',
    route: {
      auth: process.env.API_KEYS ? 'apiHeaderKeys' : false,
      cors: {
        origin: [
          'http://localhost:*',
          'https://localhost:*',
          'https://*.boston.gov',
          ...(process.env.CORS_ORIGINS
            ? process.env.CORS_ORIGINS.split(',')
            : []),
        ],
        additionalHeaders: ['X-API-KEY'],
      },
    },
  });

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
      return () =>
        Promise.all([
          server.stop(),
          commissionsDbPool ? commissionsDbPool.close() : Promise.resolve(),
        ]);
    },
  };
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
