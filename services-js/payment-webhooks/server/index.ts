/* eslint no-console: 0 */

// Entrypoint for our server. Uses require so we can control import order
// and set up error reporting before getting the main server.js file going.

require('dotenv').config();

const Rollbar = require('rollbar');
const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    environment: process.env.ROLLBAR_ENV || process.env.NODE_ENV,
  },
});

const start = require('./server.js').default;

start({ rollbar }).catch(err => {
  console.error('Error starting server', err);
  process.exit(-1);
});
