/* eslint no-console: 0 */

// We use require in here so we can be deliberate about load order.
// We don't want any local configurations to affect the test runs
if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'testcafe') {
  require('dotenv').config();
}

const Rollbar = require('rollbar');
const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    environment: process.env.ROLLBAR_ENVIRONMENT || process.env.NODE_ENV,
  },
});

require('./server')
  .default({ rollbar })
  .catch(err => {
    rollbar.error(err, e => {
      if (e) {
        console.error('Error sending exception to Rollbar', e);
      } else {
        console.info(`Error logged to Rollbar`);
      }

      process.exit(-1);
    });

    console.error('Error starting server');
    console.error(err);
  });
