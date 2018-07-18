/* eslint no-console: 0 */

/**
 * @file Entrypoint for our server. Uses `require` so we can control import
 * order and set up error reporting before getting the main server file going.
 */

require('dotenv').config();
const startServer = require('./access-boston').default;

startServer().catch((err: Error) => {
  console.error('Error starting server', err);
  process.exit(1);
});
