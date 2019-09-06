/* eslint no-console: 0 */

import { Server as HapiServer } from 'hapi';
import cleanup from 'node-cleanup';
import decryptEnv from '@cityofboston/srv-decrypt-env';

const port = parseInt(process.env.PORT || '7000', 10);

export async function makeServer() {
  const serverOptions = {
    port,
  };

  const server = new HapiServer(serverOptions);

  // Add services to wait for in here.
  // Returns an async shutdown method.
  const startup = async () => {
    return async () => {};
  };

  try {
    // method: GET | url: /
    server.route({
      method: 'GET',
      path: '/',
      handler: () => {
        return 'Title';
      },
    });

    // method: GET | url: /access-boston/api/v1/ok
    server.route({
      method: 'GET',
      path: '/access-boston/api/v1/ok',
      handler: () => 'ok',
      options: {
        // mark this as a health check so that it doesn’t get logged
        tags: ['health'],
      },
    });
  } catch (err) {
    console.log('try/catch: err: ', err);
  }

  return { server, startup };
}

export default (async function startServer() {
  await decryptEnv();
  console.log('decryptEnv');

  const { server, startup } = await makeServer();

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

  console.log('await server.start');
  await server.start();

  console.log(`> Ready on http://localhost:${port}`);
});
