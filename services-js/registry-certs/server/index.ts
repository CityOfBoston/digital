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
    environment: process.env.ROLLBAR_ENVIRONMENT || process.env.NODE_ENV,
  },
});

try {
  const start = require('./server').default;

  start({ rollbar }).catch(err => {
    console.error('Error starting server');
    console.error(err);
    rollbar.error(err, () => {
      process.exit(1);
    });
  });
} catch (e) {
  console.error(e);
  process.exit(-1);
}
