// @flow
/* eslint no-console: 0 */

import fs from 'fs';
import Hapi from 'hapi';
import Good from 'good';
import cleanup from 'node-cleanup';
import makeStripe from 'stripe';

import decryptEnv from './lib/decrypt-env';
import { reportDeployToOpbeat } from './lib/opbeat-utils';

import { makeINovahFactory, type INovahFactory } from './services/INovah';

import { processStripeEvent } from './stripe-events';

type Opbeat = $Exports<'opbeat'>;

type ServerArgs = {
  opbeat: Opbeat,
};

const port = parseInt(process.env.PORT || '5000', 10);

export function makeServer({ opbeat }: ServerArgs) {
  const server = new Hapi.Server();

  if (process.env.USE_SSL) {
    const tls = {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.crt'),
    };

    server.connection({ port, tls }, '0.0.0.0');
  } else {
    server.connection({ port }, '0.0.0.0');
  }

  const stripe = makeStripe(process.env.STRIPE_SECRET_KEY || 'fake-secret-key');

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
      opbeat
    );

    return async () => {};
  };

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

  server.route({
    method: 'GET',
    path: '/admin/ok',
    handler: (request, reply) => reply('ok'),
    config: {
      // mark this as a health check so that it doesn’t get logged
      tags: ['health'],
    },
  });

  server.route({
    method: 'POST',
    path: '/stripe',
    config: {
      payload: {
        output: 'data',
        parse: false,
      },
    },
    handler: async (request, reply) => {
      try {
        await processStripeEvent(
          {
            opbeat,
            stripe,
            inovah: await inovahFactory.inovah(
              process.env.INOVAH_PAYMENT_ORIGIN
            ),
          },
          stripeWebhookSecret,
          request.headers['stripe-signature'],
          (request.payload: any).toString()
        );
        reply().code(200);
      } catch (e) {
        opbeat.captureError(e);
        reply(e);
      }
    },
  });

  server.route({
    method: 'GET',
    path: '/inovah/describe',
    handler: async (request, reply) => {
      const iNovah = await inovahFactory.inovah(
        process.env.INOVAH_PAYMENT_ORIGIN
      );
      const description = await iNovah.describe();

      reply(JSON.stringify(description, null, 2)).type('text/plain');
    },
  });

  return { server, startup };
}

export default (async function startServer(args: ServerArgs) {
  await decryptEnv();

  reportDeployToOpbeat(args.opbeat, process.env.OPBEAT_APP_ID);

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
      }
    );

    cleanup.uninstall();
    return false;
  });

  await server.start();

  console.log(`> Ready on http://localhost:${port}`);
});
