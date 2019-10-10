/* eslint no-console: 0 */

/**
 * @file Entrypoint for our server. Uses `require` so we can control import
 * order and set up error reporting before getting the main server file going.
 */

// We don't want any local configurations to affect the test runs
if (
  process.env.NODE_ENV !== 'test' &&
  process.env.NODE_ENV !== ('testcafe' as any)
) {
  require('dotenv').config();
}
console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);

const Rollbar = require('rollbar');
const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  scrubFields: ['currentPassword', 'newPassword', 'confirmPassword'],
  payload: {
    environment: process.env.ROLLBAR_ENVIRONMENT || process.env.NODE_ENV,
  },
});

const startServer = require('./access-boston').default;

startServer(rollbar).catch((err: Error) => {
  console.error('Error starting server', err);
  process.exit(1);
});

console.log('process.env: ', process.env);

export {};
