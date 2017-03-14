// @flow
/* eslint no-console: 0 */

// We use require in here so we can be deliberate about load order.

require('dotenv').config();

const newrelic = require('newrelic');

const opbeat = require('opbeat').start({
  appId: process.env.OPBEAT_APP_ID,
  organizationId: process.env.OPBEAT_ORGANIZATION_ID,
  secretToken: process.env.OPBEAT_SECRET_TOKEN,
  active: process.env.NODE_ENV === 'production',
});

const rollbar = require('rollbar');

rollbar.handleUncaughtExceptionsAndRejections(process.env.ROLLBAR_SERVER_KEY, {
  environment: process.env.HEROKU_PIPELINE || process.env.NODE_ENV || 'development',
  enabled: (process.env.NODE_ENV || 'development') !== 'development',
});

require('./server').default({ opbeat, rollbar, newrelic }).catch((err) => {
  opbeat.captureError(err, (e, url) => {
    if (e) {
      console.error('Error sending exception to Opbeat', e);
    } else if (url) {
      console.info(`Error logged to Opbeat: ${url}`);
    }
  });

  newrelic.noticeError(err);
  rollbar.handlerError(err);
  console.error('Error starting server');
  console.error(err);
});
