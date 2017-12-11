// @flow
/* eslint no-console: 0 */

import Hapi from 'hapi';
import Good from 'good';
import cleanup from 'node-cleanup';

import INovah from './services/INovah';

type Opbeat = $Exports<'opbeat'>;

type ServerArgs = {
  opbeat: Opbeat,
};

const port = parseInt(process.env.PORT || '5000', 10);

export function makeServer({ opbeat }: ServerArgs) {
  const server = new Hapi.Server();
  server.connection({ port }, '0.0.0.0');

  // Add services to wait for in here.
  // Returns an async shutdown method.
  const startup = async () => async () => {};

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

  const makeINovah = () =>
    new INovah(
      process.env.INOVAH_ENDPOINT,
      process.env.INOVAH_USERNAME,
      process.env.INOVAH_PASSWORD,
      process.env.INOVAH_PAYMENT_ORIGIN,
      opbeat
    );

  server.route({
    method: 'GET',
    path: '/admin/ok',
    handler: (request, reply) => reply('ok'),
  });

  server.route({
    method: 'GET',
    path: '/describe',
    handler: async (request, reply) => {
      const iNovah = makeINovah();
      const description = await iNovah.describe();

      reply(JSON.stringify(description, null, 2)).type('text/plain');
    },
  });

  server.route({
    method: 'GET',
    path: '/login',
    handler: async (request, reply) => {
      const iNovah = makeINovah();
      const key = await iNovah.registerSecurityKey();

      reply(key);
    },
  });

  server.route({
    method: 'GET',
    path: '/payment',
    handler: async (request, reply) => {
      const iNovah = makeINovah();
      const transactionId = await iNovah.addTransaction(15);

      reply(`Transaction ID: ${transactionId}`).type('text/plain');
    },
  });

  server.route({
    method: 'GET',
    path: '/void/{transactionId}',
    handler: async (request, reply) => {
      const iNovah = makeINovah();
      const output = await iNovah.voidTransaction(request.params.transactionId);

      reply(output).type('text/plain');
    },
  });

  return { server, startup };
}

export default (async function startServer(args: ServerArgs) {
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
