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
    handler: async (request, reply) => {
      try {
        await processStripeEvent(
          stripe,
          inovahFactory.inovah(process.env.INOVAH_PAYMENT_ORIGIN),
          (request.payload: any)
        );
        reply().code(200);
      } catch (e) {
        reply(e);
      }
    },
  });

  server.route({
    method: 'GET',
    path: '/describe',
    handler: async (request, reply) => {
      const iNovah = inovahFactory.inovah(process.env.INOVAH_PAYMENT_ORIGIN);
      const description = await iNovah.describe();

      reply(JSON.stringify(description, null, 2)).type('text/plain');
    },
  });

  server.route({
    method: 'GET',
    path: '/payment',
    handler: async (request, reply) => {
      const iNovah = inovahFactory.inovah(process.env.INOVAH_PAYMENT_ORIGIN);
      const transactionId = await iNovah.addTransaction(15);

      reply(`Transaction ID: ${transactionId}`).type('text/plain');
    },
  });

  server.route({
    method: 'GET',
    path: '/void/{transactionId}',
    handler: async (request, reply) => {
      const iNovah = inovahFactory.inovah(process.env.INOVAH_PAYMENT_ORIGIN);
      const output = await iNovah.voidTransaction(request.params.transactionId);

      reply(output).type('text/plain');
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
