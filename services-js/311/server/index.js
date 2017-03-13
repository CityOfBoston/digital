// @flow
/* eslint no-console: 0 */

// We use require in here so we can be deliberate about load order.

require('dotenv').config();

const opbeat = require('opbeat').start({
  appId: 'dbd94d8c1a',
  organizationId: '3a2bb4270ee94e65ac727ec16c7482e2',
  secretToken: process.env.OPBEAT_KEY,
});

const rollbar = require('rollbar');

rollbar.handleUncaughtExceptionsAndRejections(process.env.ROLLBAR_SERVER_KEY, {
  environment: process.env.HEROKU_PIPELINE || process.env.NODE_ENV || 'development',
  enabled: (process.env.NODE_ENV || 'development') !== 'development',
});

require('./server').default({ opbeat, rollbar }).catch((err) => {
  console.error('Error starting server');
  console.error(err);
});
