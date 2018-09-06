// @flow
/* eslint no-console: 0 */

// Entrypoint for our server. Uses require so we can control import order
// and set up error reporting before getting the main server.js file going.

require('dotenv').config();
const opbeat = require('opbeat/start');

// This monkeypatches the environment to add window and an XMLHttpRequest
// implementation.
require('cometd-nodejs-client').adapt();

const start = require('./server.js').default;

start({ opbeat }).catch(err => {
  console.error('Error starting server', err);
});
