// @flow
/* eslint no-console: 0 */

// We use require in here so we can be deliberate about load order.

require('dotenv').config();

const opbeat = require('opbeat').start({
  appId: process.env.OPBEAT_APP_ID,
  organizationId: process.env.OPBEAT_ORGANIZATION_ID,
  secretToken: process.env.OPBEAT_SECRET_TOKEN,
  active: process.env.NODE_ENV === 'production',
});

const rollbar = require('rollbar');

// Only turn this on in production because it hides exceptions thrown as the
// app is starting up in dev.
if (process.env.NODE_ENV === 'production') {
  rollbar.handleUncaughtExceptionsAndRejections(process.env.ROLLBAR_SERVER_KEY, {
    environment: process.env.HEROKU_PIPELINE || process.env.NODE_ENV || 'development',
    exitOnUncaughtException: true,
  });
}

require('./server').default({ opbeat, rollbar }).catch((err) => {
  opbeat.captureError(err, (e, url) => {
    if (e) {
      console.error('Error sending exception to Opbeat', e);
    } else if (url) {
      console.info(`Error logged to Opbeat: ${url}`);
    }
  });

  rollbar.handlerError(err);
  console.error('Error starting server');
  console.error(err);
});
