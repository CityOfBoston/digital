/* eslint no-console: 0 */

// Entrypoint for our server. Uses require so we can control import order
// and set up error reporting before getting the main server.js file going.

require('dotenv').config();
import { filterObj, filteredObjKeys } from '../lib/helpers';
// import { process } from 'node';

const startUp = () => {
  const start = require('./server').default;
  console.log('start.server');

  start().catch(err => {
    console.error('Error starting server', err);
    process.exit(1);
  });
  const filtered_obj_keys = filteredObjKeys(process.env, 'LDAP_');
  const filtered_obj = filterObj(process.env, filtered_obj_keys);
  console.log('filterObj > process.env(LDAP): ', filtered_obj);
};

try {
  startUp();
} catch (e) {
  console.error(e);
  // process.exit(-1);
  startUp();
}

// import process from 'node';
// import process from 'node:process';

// process.on('uncaughtException', (error, origin) => {
//   if (error && error.code === 'ECONNRESET') return;
//   console.error('UNCAUGHT EXCEPTION');
//   console.error(error);
//   console.error(origin);
//   process.exit(1);
// });
