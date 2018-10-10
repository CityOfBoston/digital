/* eslint no-console: 0 */
import Hapi from 'hapi';
import next from 'next';
import Inert from 'inert';
import fs from 'fs';
import { graphqlHapi, graphiqlHapi } from 'apollo-server-hapi';
import cleanup from 'node-cleanup';
import makeStripe from 'stripe';
import { Client as PostmarkClient } from 'postmark';
import Rollbar from 'rollbar';

import {
  loggingPlugin,
  adminOkRoute,
  makeStaticAssetRoutes,
  headerKeys,
  HeaderKeysOptions,
  rollbarPlugin,
  graphqlOptionsWithRollbar,
} from '@cityofboston/hapi-common';

import { makeRoutesForNextApp, makeNextHandler } from '@cityofboston/hapi-next';

import {
  GRAPHQL_PATH_KEY,
  API_KEY_CONFIG_KEY,
  HAPI_INJECT_CONFIG_KEY,
} from '@cityofboston/next-client-common';

import decryptEnv from '@cityofboston/srv-decrypt-env';

import {
  makeRegistryDataFactory,
  makeFixtureRegistryDataFactory,
  RegistryDataFactory,
} from './services/RegistryData';

import {
  makeRegistryOrdersFactory,
  makeFixtureRegistryOrdersFactory,
  RegistryOrdersFactory,
} from './services/RegistryOrders';

import Emails from './services/Emails';

import { processStripeEvent } from './stripe-events';

import schema, { Context } from './graphql';

type ServerArgs = {
  rollbar: Rollbar;
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

  // We load the config ourselves so that we can modify the runtime configs
  // from here.
  const config = require('../../next.config.js');

  config.publicRuntimeConfig = {
    ...config.publicRuntimeConfig,
    [GRAPHQL_PATH_KEY]: '/graphql',
    [API_KEY_CONFIG_KEY]: process.env.WEB_API_KEY || '',
    stripePublishableKey:
      process.env.STRIPE_PUBLISHABLE_KEY || 'fake-stripe-key',
  };

  config.serverRuntimeConfig = {
    ...config.serverRuntimeConfig,
    [HAPI_INJECT_CONFIG_KEY]: server.inject.bind(server),
  };

  const app = next({
    dev: process.env.NODE_ENV !== 'production' && !process.env.USE_BUILD,
    quiet: process.env.NODE_ENV === 'test',
    config,
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

    registryDataFactory = services[0] as any;
    registryOrdersFactory = services[1] as any;

    return async () => {
      await Promise.all([
        registryDataFactory.cleanup(),
        registryOrdersFactory.cleanup(),
        app.close(),
        server.stop(),
      ]);
    };
  };

  server.auth.scheme('headerKeys', headerKeys);
  server.auth.strategy('apiHeaderKeys', 'headerKeys', {
    header: 'X-API-KEY',
    keys: process.env.API_KEYS ? process.env.API_KEYS.split(',') : [],
  } as HeaderKeysOptions);

  await server.register({
    plugin: rollbarPlugin,
    options: { rollbar },
  });

  if (process.env.NODE_ENV !== 'test') {
    await server.register(loggingPlugin);
  }

  await server.register(Inert);

  await server.register({
    plugin: graphqlHapi,
    options: {
      path: '/graphql',
      // We use a function here so that all of our services are request-scoped
      // and can cache within the same query but not leak to others.
      graphqlOptions: graphqlOptionsWithRollbar(rollbar, () => ({
        schema,
        context: {
          registryData: registryDataFactory.registryData(),
          registryOrders: registryOrdersFactory.registryOrders(),
          stripe,
          emails,
          rollbar,
        } as Context,
      })),
      route: {
        cors: true,
        auth: 'apiHeaderKeys',
      },
    },
  });

  server.register({
    plugin: graphiqlHapi,
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
    handler: (_, h) => h.redirect(process.env.ROOT_REDIRECT_URL || '/death'),
  });

  server.route(adminOkRoute);

  // Stripe webhook handler. Used to reliably complete the order process when
  // charges succeed.
  server.route({
    method: 'POST',
    path: '/stripe',
    options: {
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
          (request.payload as any).toString()
        );
        return '';
      } catch (e) {
        rollbar.error(e, request.raw.req);
        throw e;
      }
    },
  });

  server.route(makeRoutesForNextApp(app));
  server.route({
    method: 'GET',
    path: '/death/certificate/{id}',
    handler: makeNextHandler(app, '/death/certificate'),
  });

  server.route(makeStaticAssetRoutes());

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
