// @flow
/* eslint no-console: 0 */

import Hapi from 'hapi';
import Good from 'good';
import cleanup from 'node-cleanup';

type Opbeat = $Exports<'opbeat'>;

type ServerArgs = {
  opbeat: Opbeat,
};

const port = parseInt(process.env.PORT || '5000', 10);

// eslint-disable-next-line no-unused-vars
export function makeServer({opbeat}: ServerArgs) {
  const server = new Hapi.Server();
  server.connection({port}, '0.0.0.0');

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

  server.route({
    method: 'GET',
    path: '/admin/ok',
    handler: (request, reply) => reply('ok'),
  });

  return {server, startup};
}

export default (async function startServer(args: ServerArgs) {
  const {server, startup} = makeServer(args);

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
});
