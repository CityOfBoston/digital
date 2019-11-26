/* eslint no-console: 0 */

import { Server as HapiServer } from 'hapi';
import cleanup from 'node-cleanup';
import decryptEnv from '@cityofboston/srv-decrypt-env';

require('dotenv').config();

const port = '3000';

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
    // method: GET | url: /ok
    server.route({
      method: 'GET',
      path: '/admin/ok',
      handler: () => 'ok',
      options: {
        // mark this as a health check so that it doesn’t get logged
        tags: ['health'],
      },
    });
    // method: GET | url: /ok
    server.route({
      method: 'GET',
      path: '/',
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
