/* eslint no-console: 0 */

import fs from 'fs';

import Hapi, { Request } from 'hapi';
import Boom from 'boom';
import cleanup from 'node-cleanup';
import acceptLanguagePlugin from 'hapi-accept-language2';

// https://github.com/apollographql/apollo-server/issues/927
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi');

import {
  loggingPlugin,
  adminOkRoute,
  headerKeys,
  HeaderKeysOptions,
} from '@cityofboston/hapi-common';

import graphqlSchema from './graphql/schema';

const PATH_PREFIX = '/commissions';
const port = parseInt(process.env.PORT || '3000', 10);
const dev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

export async function makeServer() {
  const serverOptions = {
    host: '0.0.0.0',
    port,
    tls: undefined,
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

  const server = new Hapi.Server(serverOptions);

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

  server.route(adminOkRoute);

  await server.register({
    plugin: graphqlHapi,
    options: {
      path: `${PATH_PREFIX}/graphql`,
      auth: 'headerKeys',
      graphqlOptions: (req: Request) => ({
        schema: graphqlSchema,
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
      await server.start();

      console.log(`> Ready on http://localhost:${port}${PATH_PREFIX}`);

      // Add more shutdown code here.
      return () => Promise.all([server.stop()]);
    },
  };
}

export default async function startServer() {
  const { startup } = await makeServer();
  const shutdown = await startup();

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
