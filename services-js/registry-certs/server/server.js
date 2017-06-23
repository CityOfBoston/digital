// @flow
/* eslint no-console: 0 */
import Hapi from 'hapi';
import Good from 'good';
import next from 'next';
import Boom from 'boom';
import fs from 'fs';
import { graphqlHapi, graphiqlHapi } from 'graphql-server-hapi';
import cleanup from 'node-cleanup';

import { nextHandler, nextDefaultHandler } from './next-handlers';
import addRequestAdditions from './request-additions';
import {
  makeRegistryFactory,
  makeFixtureRegistryFactory,
} from './services/Registry';
import type { RegistryFactory } from './services/Registry';

import schema from './graphql';
import type { Context } from './graphql';

import { opbeatWrapGraphqlOptions } from './opbeat-graphql';

type Opbeat = $Exports<'opbeat'>;

type ServerArgs = {
  opbeat: Opbeat,
};

const port = parseInt(process.env.PORT || '3000', 10);

export function makeServer({ opbeat }: ServerArgs) {
  const server = new Hapi.Server();

  if (process.env.USE_SSL) {
    const tls = {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.crt'),
    };

    server.connection({ port: '3443', tls }, '0.0.0.0');
  } else {
    server.connection({ port }, '0.0.0.0');
  }

  const app = next({
    dev: process.env.NODE_ENV !== 'production',
    quiet: process.env.NODE_ENV === 'test',
  });

  const registryFactoryOpts = {
    user: process.env.REGISTRY_DB_USER,
    password: process.env.REGISTRY_DB_PASSWORD,
    domain: process.env.REGISTRY_DB_DOMAIN,
    server: process.env.REGISTRY_DB_SERVER,
    database: process.env.REGISTRY_DB_DATABASE,
  };

  let registryFactory: RegistryFactory;

  const startup = async () => {
    const services = await Promise.all([
      registryFactoryOpts.server
        ? makeRegistryFactory(registryFactoryOpts)
        : makeFixtureRegistryFactory('fixtures/registry/smith.json'),
      app.prepare(),
    ]);

    registryFactory = services[0];

    return async () => {
      await Promise.all([
        registryFactory.cleanup(),
        app.close(),
        server.stop(),
      ]);
    };
  };

  server.auth.scheme(
    'headerKeys',
    (s, { keys, header }: { header: string, keys: string[] }) => ({
      authenticate: (request, reply) => {
        const key = request.headers[header.toLowerCase()];
        if (!key) {
          reply(Boom.unauthorized(`Missing ${header} header`));
        } else if (keys.indexOf(key) === -1) {
          reply(Boom.unauthorized(`Key ${key} is not a valid key`));
        } else {
          reply.continue({ credentials: key });
        }
      },
    }),
  );

  server.auth.strategy('apiKey', 'headerKeys', {
    header: 'X-API-KEY',
    keys: process.env.API_KEYS ? process.env.API_KEYS.split(',') : [],
  });

  if (process.env.NODE_ENV !== 'test') {
    server.register({
      register: Good,
      options: {
        reporters: {
          console: [
            {
              module: 'good-squeeze',
              name: 'Squeeze',
              args: [
                {
                  response: '*',
                  log: '*',
                },
              ],
            },
            {
              module: 'good-console',
              args: [
                {
                  color: process.env.NODE_ENV !== 'production',
                },
              ],
            },
            'stdout',
          ],
        },
      },
    });
  }

  server.register({
    register: graphqlHapi,
    options: {
      path: '/graphql',
      // We use a function here so that all of our services are request-scoped
      // and can cache within the same query but not leak to others.
      graphqlOptions: opbeatWrapGraphqlOptions(opbeat, () => ({
        schema,
        context: ({
          registry: registryFactory.registry(),
        }: Context),
      })),
      route: {
        cors: true,
        auth: 'apiKey',
      },
    },
  });

  server.register({
    register: graphiqlHapi,
    options: {
      path: '/graphiql',
      graphiqlOptions: {
        endpointURL: '/graphql',
        passHeader: `'X-API-KEY': '${process.env.WEB_API_KEY || ''}'`,
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, reply) => reply.redirect('/death'),
  });

  server.route({
    method: 'GET',
    path: '/death/certificate/{id}',
    handler: addRequestAdditions(nextHandler(app, '/death/certificate')),
  });

  server.route({
    method: 'GET',
    path: '/{p*}',
    handler: addRequestAdditions(nextHandler(app)),
  });

  server.route({
    method: 'GET',
    path: '/_next/{p*}',
    handler: nextDefaultHandler(app),
  });

  server.route({
    method: 'GET',
    path: '/static/{p*}',
    handler: nextDefaultHandler(app, { cache: true }),
  });

  return {
    server,
    startup,
  };
}

export default async function startServer(args: ServerArgs) {
  const { server, startup } = makeServer(args);

  const shutdown = await startup();
  cleanup(exitCode => {
    shutdown().then(
      () => {
        process.exit(exitCode);
      },
      err => {
        console.log('CLEAN EXIT FAILED', err);
        process.exit(-1);
      },
    );

    cleanup.uninstall();
    return false;
  });

  await server.start();

  console.log(`> Ready on http://localhost:${port}`);
}
