/* eslint no-console: 0 */

// Entrypoint for our server. Uses require so we can control import order
// and set up error reporting before getting the main server.js file going.

require('dotenv').config();

const startUp = () => {
  const start = require('../group-mgmt').default;
  console.log('start.server');

  start().catch(err => {
    console.error('Error starting server', err);
    process.exit(1);
  });
  console.log('process.env: ', process.env);
};

try {
  startUp();
} catch (e) {
  console.error(e);
  // process.exit(-1);
  startUp();
}
