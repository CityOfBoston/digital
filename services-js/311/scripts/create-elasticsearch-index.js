// @flow
/* eslint no-console: 0 */

import dotenv from 'dotenv';

import SearchBox from '../server/services/SearchBox';

dotenv.config();

((async function initializeIndex() {
  const searchBox = new SearchBox(process.env.SEARCHBOX_URL, process.env.ELASTICSEARCH_INDEX);
  await searchBox.initIndex();
}()).catch((err) => {
  console.error(err);
  process.exit(1);
}));
