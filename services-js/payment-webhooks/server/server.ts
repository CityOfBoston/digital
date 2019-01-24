/* eslint no-console: 0 */

import fs from 'fs';
import Hapi from 'hapi';
import cleanup from 'node-cleanup';
import Stripe from 'stripe';

import {
  loggingPlugin,
  adminOkRoute,
  rollbarPlugin,
} from '@cityofboston/hapi-common';
import decryptEnv from '@cityofboston/srv-decrypt-env';

import { makeINovahFactory, INovahFactory } from './services/INovah';

import { processStripeEvent } from './stripe-events';

import Rollbar from 'rollbar';

type ServerArgs = {
  rollbar: Rollbar;
};

const port = parseInt(process.env.PORT || '5000', 10);

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

  await server.register({
    plugin: rollbarPlugin,
    options: { rollbar },
  });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'fake-secret-key');

  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (process.env.NODE_ENV === 'production' && !stripeWebhookSecret) {
    throw new Error('NEED A WEBHOOK SECRET IN PROD');
  }

  // Add services to wait for in here.
  // Returns an async shutdown method.
  let inovahFactory: INovahFactory;
  const startup = async () => {
    inovahFactory = await makeINovahFactory(
      process.env.INOVAH_ENDPOINT,
      process.env.INOVAH_USERNAME,
      process.env.INOVAH_PASSWORD,
      rollbar
    );

    return async () => {};
  };

  if (process.env.NODE_ENV !== 'test') {
    await server.register(loggingPlugin);
  }

  server.route(adminOkRoute);

  server.route({
    method: 'POST',
    path: '/stripe',
    options: {
      payload: {
        output: 'data',
        parse: false,
      },
    },
    handler: async (request, h) => {
      await processStripeEvent(
        {
          rollbar,
          stripe,
          inovah: await inovahFactory.inovah(process.env.INOVAH_PAYMENT_ORIGIN),
        },
        stripeWebhookSecret,
        request.headers['stripe-signature'],
        (request.payload as any).toString()
      );

      return h.response();
    },
  });

  server.route({
    method: 'GET',
    path: '/inovah/describe',
    handler: async (_, h) => {
      const iNovah = await inovahFactory.inovah(
        process.env.INOVAH_PAYMENT_ORIGIN
      );
      const description = await iNovah.describe();

      return h
        .response(JSON.stringify(description, null, 2))
        .type('text/plain');
    },
  });

  return { server, startup };
}

export default (async function startServer(args: ServerArgs) {
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
});
