/* eslint no-console: 0 */

import fs from 'fs';

import { Server as HapiServer } from 'hapi';
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
  headerKeys,
  HeaderKeysOptions,
} from '@cityofboston/hapi-common';

import { makeRoutesForNextApp } from '@cityofboston/hapi-next';

import { createConnectionPool } from '@cityofboston/mssql-common';
import decryptEnv from '@cityofboston/srv-decrypt-env';

import graphqlSchema, { Context } from './graphql/schema';
import CommissionsDao from './dao/CommissionsDao';
import CommissionsDaoFake from './dao/CommissionsDaoFake';
import { ConnectionPool } from 'mssql';

const PATH_PREFIX = '/commissions';
const dev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

export async function makeServer(port) {
  let makeCommissionsDao: () => CommissionsDao;
  let commissionsDbPool: ConnectionPool | null = null;

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
        process.exit(-1);
      }
    );

    makeCommissionsDao = () => new CommissionsDao(commissionsDbPool!);
  }

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
    };

    config.serverRuntimeConfig = {
      ...config.serverRuntimeConfig,
      [HAPI_INJECT_CONFIG_KEY]: server.inject.bind(server),
    };

    nextApp = next({
      dev,
      dir: 'src',
      config,
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

  // We start up the server in test, and we don’t want it logging.
  if (process.env.NODE_ENV !== 'test') {
    await server.register(loggingPlugin);
  }

  server.route({
    method: 'GET',
    path: '/commissions',
    handler: (_, h) => h.redirect('/commissions/apply'),
  });

  server.route(adminOkRoute);

  if (nextApp) {
    server.route(makeRoutesForNextApp(nextApp, '/commissions/'));
  }

  await server.register({
    plugin: graphqlHapi,
    options: {
      path: `${PATH_PREFIX}/graphql`,
      auth: 'apiHeaderKeys',
      graphqlOptions: () => ({
        schema: graphqlSchema,
        context: {
          commissionsDao: makeCommissionsDao(),
        } as Context,
      }),
    },
  });

  await server.register({
    plugin: graphiqlHapi,
    options: {
      path: `${PATH_PREFIX}/graphiql`,
      graphiqlOptions: {
        endpointURL: `${PATH_PREFIX}/graphql`,
        passHeader: `'X-API-KEY': '${process.env.WEB_API_KEY || ''}'`,
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
