// @flow
/* eslint no-console: 0 */

// Entrypoint for our server. Uses require so we can control import order
// and set up error reporting before getting the main server.js file going.

console.log('----- SERVER STARTUP -----');

require('dotenv').config();
const opbeat = require('opbeat/start');

// This monkeypatches the environment to add window and an XMLHttpRequest
// implementation.
require('cometd-nodejs-client').adapt();

const start = require('./server.js').default;

start({ opbeat }).catch(err => {
  console.log('----- SERVER FAILURE -----');
  console.error(err);

  // We use process.kill to trigger any cleanup actions. process.exit won't let
  // us do async cleanup through the node-cleanup library.
  process.kill(process.pid, 'SIGTERM');
});
