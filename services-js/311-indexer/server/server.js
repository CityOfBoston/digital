// @flow
/* eslint no-console: 0 */

import cleanup from 'node-cleanup';

type Opbeat = $Exports<'opbeat'>;

type ServerArgs = {
  opbeat: Opbeat,
};

export default async function startServer(args: ServerArgs) {
  console.log('Server starting!', args);
  const shutdown = () => Promise.resolve();

  cleanup(exitCode => {
    shutdown().then(
      () => {
        process.exit(exitCode || 0);
      },
      err => {
        console.log('CLEAN EXIT FAILED', err);
        process.exit(-1);
      }
    );

    cleanup.uninstall();
    return false;
  });

  console.log('> Ready');
}
