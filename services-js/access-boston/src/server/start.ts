/* eslint no-console: 0 */

/**
 * @file Entrypoint for our server. Uses `require` so we can control import
 * order and set up error reporting before getting the main server file going.
 */

// We don't want any local configurations to affect the test runs
if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'testcafe') {
  require('dotenv').config();
}

const startServer = require('./access-boston').default;

startServer().catch((err: Error) => {
  console.error('Error starting server', err);
  process.exit(1);
});
