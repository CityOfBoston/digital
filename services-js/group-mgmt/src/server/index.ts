/* eslint no-console: 0 */

// Entrypoint for our server. Uses require so we can control import order
// and set up error reporting before getting the main server.js file going.

require('dotenv').config();
import { filterObj, filteredObjKeys } from '../lib/helpers';

try {
  const start = require('./server').default;
  console.log('start.server');

  start().catch(err => {
    console.error('Error starting server', err);
    process.exit(1);
  });
  const filtered_obj_keys = filteredObjKeys(process.env, 'LDAP_');
  const filtered_obj = filterObj(process.env, filtered_obj_keys);
  console.log('process.env(LDAP): ', filtered_obj);
} catch (e) {
  console.error(e);
  process.exit(-1);
}
