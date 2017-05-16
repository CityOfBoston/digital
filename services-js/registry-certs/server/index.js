// @flow
/* eslint no-console: 0 */

// Entrypoint for our server. Uses require so we can control import order
// and set up error reporting before getting the main server.js file going.

require('dotenv').config();

const start = require('./server.js').default;

start().catch((err) => {
  console.error('Error starting server', err);
});
