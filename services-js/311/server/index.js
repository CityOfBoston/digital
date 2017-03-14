// @flow
/* eslint no-console: 0 */

// We use require in here so we can be deliberate about load order.

require('dotenv').config();

const newrelic = require('newrelic');
const rollbar = require('rollbar');

rollbar.handleUncaughtExceptionsAndRejections(process.env.ROLLBAR_SERVER_KEY, {
  environment: process.env.HEROKU_PIPELINE || process.env.NODE_ENV || 'development',
  enabled: (process.env.NODE_ENV || 'development') !== 'development',
});

require('./server').default({ rollbar, newrelic }).catch((err) => {
  newrelic.noticeError(err);
  rollbar.handlerError(err);

  console.error('Error starting server');
  console.error(err);
});
