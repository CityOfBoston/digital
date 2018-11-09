/* eslint no-console: 0 */

/**
 * @file Entrypoint for our server. Uses `require` so we can control import
 * order and set up error reporting before getting the main server file going.
 */

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

const start = require('./server').default;

start(parseInt(process.env.PORT || '8000', 10), rollbar).catch(err => {
  console.error('Error starting server', err);
  process.exit(1);
});
