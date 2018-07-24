// @flow
/* eslint no-console: 0 */
import Hapi from 'hapi';
import Good from 'good';
import next from 'next';
import Boom from 'boom';
import Inert from 'inert';
import fs from 'fs';
import Path from 'path';
import { graphqlHapi, graphiqlHapi } from 'apollo-server-hapi';
import cleanup from 'node-cleanup';
import makeStripe from 'stripe';
import { Client as PostmarkClient } from 'postmark';

import { nextHandler, nextDefaultHandler } from './lib/next-handlers';
import addRequestAdditions from './lib/request-additions';
import decryptEnv from './lib/decrypt-env';
import { rollbarWrapGraphqlOptions, hapiPlugin } from './lib/rollbar-utils';

import {
  makeRegistryDataFactory,
  makeFixtureRegistryDataFactory,
  type RegistryDataFactory,
} from './services/RegistryData';

import {
  makeRegistryOrdersFactory,
  makeFixtureRegistryOrdersFactory,
  type RegistryOrdersFactory,
} from './services/RegistryOrders';

import Emails from './services/Emails';

import { processStripeEvent } from './stripe-events';

import schema from './graphql';
import type { Context } from './graphql';

import type Rollbar from 'rollbar';

type ServerArgs = {
  rollbar: Rollbar,
};

const port = parseInt(process.env.PORT || '3000', 10);

export async function makeServer({ rollbar }: ServerArgs) {
  const serverOptions = {
    port,
    ...(process.env.USE_SSL
      ? {
          tls: {
            key: fs.readFileSync('server.key'),
            cert: fs.readFileSync('server.crt'),
          },
        }
      : {}),
  };

  const server = new Hapi.Server(serverOptions);

  const app = next({
    dev: process.env.NODE_ENV !== 'production' && !process.env.USE_BUILD,
    quiet: process.env.NODE_ENV === 'test',
  });

  const registryDataFactoryOpts = {
    user: process.env.REGISTRY_DATA_DB_USER,
    password: process.env.REGISTRY_DATA_DB_PASSWORD,
    domain: process.env.REGISTRY_DATA_DB_DOMAIN,
    server: process.env.REGISTRY_DATA_DB_SERVER,
    database: process.env.REGISTRY_DATA_DB_DATABASE,
  };

  const registryOrdersFactoryOpts = {
    user: process.env.REGISTRY_ORDERS_DB_USER,
    password: process.env.REGISTRY_ORDERS_DB_PASSWORD,
    domain: process.env.REGISTRY_ORDERS_DB_DOMAIN,
    server: process.env.REGISTRY_ORDERS_DB_SERVER,
    database: process.env.REGISTRY_ORDERS_DB_DATABASE,
  };

  const stripe = makeStripe(process.env.STRIPE_SECRET_KEY || 'fake-secret-key');
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (process.env.NODE_ENV === 'production' && !stripeWebhookSecret) {
    throw new Error('NEED A WEBHOOK SECRET IN PROD');
  }

  const postmarkClient = new PostmarkClient(
    process.env.POSTMARK_SERVER_API_TOKEN || 'fake-postmark-key'
  );

  const emails = new Emails(
    process.env.POSTMARK_FROM_ADDRESS || 'no-reply@boston.gov',
    postmarkClient,
    rollbar
  );

  let registryDataFactory: RegistryDataFactory;
  let registryOrdersFactory: RegistryOrdersFactory;

  const startup = async () => {
    const services = await Promise.all([
      registryDataFactoryOpts.server
        ? makeRegistryDataFactory(rollbar, registryDataFactoryOpts)
        : makeFixtureRegistryDataFactory('fixtures/registry-data/smith.json'),
      registryOrdersFactoryOpts.server
        ? makeRegistryOrdersFactory(rollbar, registryOrdersFactoryOpts)
        : makeFixtureRegistryOrdersFactory(),
      app.prepare(),
    ]);

    registryDataFactory = services[0];
    registryOrdersFactory = services[1];

    return async () => {
      await Promise.all([
        registryDataFactory.cleanup(),
        registryOrdersFactory.cleanup(),
        app.close(),
        server.stop(),
      ]);
    };
  };

  server.auth.scheme(
    'headerKeys',
    (s, { keys, header }: { header: string, keys: string[] }) => ({
      authenticate: async (request, h) => {
        const key = request.headers[header.toLowerCase()];
        if (!key) {
          throw Boom.unauthorized(`Missing ${header} header`);
        } else if (keys.indexOf(key) === -1) {
          throw Boom.forbidden(`Key ${key} is not a valid key`);
        } else {
          return h.authenticated({ credentials: { key } });
        }
      },
    })
  );

  server.auth.strategy('apiKey', 'headerKeys', {
    header: 'X-API-KEY',
    keys: process.env.API_KEYS
      ? process.env.API_KEYS.split(',')
      : ['test-api-key'],
  });

  await server.register({
    plugin: hapiPlugin,
    options: { rollbar },
  });

  if (process.env.NODE_ENV !== 'test') {
    await server.register({
      plugin: Good,
      options: {
        reporters: {
          console: [
            {
              module: 'good-squeeze',
              name: 'Squeeze',
              args: [
                {
                  // Keep our health checks from appearing in logs
                  response: { exclude: 'health' },
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

  await server.register(Inert);

  await server.register({
    plugin: graphqlHapi,
    options: {
      path: '/graphql',
      // We use a function here so that all of our services are request-scoped
      // and can cache within the same query but not leak to others.
      graphqlOptions: rollbarWrapGraphqlOptions(rollbar, () => ({
        schema,
        context: ({
          registryData: registryDataFactory.registryData(),
          registryOrders: registryOrdersFactory.registryOrders(),
          stripe,
          emails,
          rollbar,
        }: Context),
      })),
      route: {
        cors: true,
        auth: 'apiKey',
      },
    },
  });

  server.register({
    plugin: graphiqlHapi,
    options: {
      path: '/graphiql',
      graphiqlOptions: {
        endpointURL: '/graphql',
        passHeader: `'X-API-KEY': '${process.env.WEB_API_KEY ||
          'test-api-key'}'`,
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) =>
      h.redirect(process.env.ROOT_REDIRECT_URL || '/death'),
  });

  server.route({
    method: 'GET',
    path: '/admin/ok',
    handler: () => 'ok',
    config: {
      // mark this as a health check so that it doesn’t get logged
      tags: ['health'],
    },
  });

  // Stripe webhook handler. Used to reliably complete the order process when
  // charges succeed.
  server.route({
    method: 'POST',
    path: '/stripe',
    config: {
      payload: {
        output: 'data',
        parse: false,
      },
    },
    handler: async request => {
      try {
        await processStripeEvent(
          {
            registryData: registryDataFactory.registryData(),
            registryOrders: registryOrdersFactory.registryOrders(),
            stripe,
            emails,
          },
          stripeWebhookSecret,
          request.headers['stripe-signature'],
          (request.payload: any).toString()
        );
        return '';
      } catch (e) {
        rollbar.error(e, request.raw.req);
        throw e;
      }
    },
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
    path: '/assets/{path*}',
    handler: (request, h: any) => {
      if (!request.params.path || request.params.path.indexOf('..') !== -1) {
        throw Boom.forbidden();
      }

      const p = Path.join(
        'static',
        'assets',
        ...request.params.path.split('/')
      );

      return h
        .file(p)
        .header('Cache-Control', 'public, max-age=3600, s-maxage=600');
    },
  });

  server.route({
    method: 'GET',
    path: '/storybook/{path*}',
    handler: {
      directory: {
        path: 'storybook-static',
      },
    },
  });

  return {
    server,
    startup,
  };
}

export default async function startServer(args: ServerArgs) {
  await decryptEnv();

  const { server, startup } = await makeServer(args);

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

  await server.start();

  console.log(`> Ready on http://localhost:${port}`);
}
