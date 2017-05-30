// @flow
/* eslint no-console: 0 */

import 'isomorphic-fetch';
import dotenv from 'dotenv';

import Open311 from '../server/services/Open311';
import SearchBox from '../server/services/SearchBox';
import type { BulkResponse } from '../server/services/SearchBox';
import type { ServiceRequest } from '../server/services/Open311';

dotenv.config();

function loadRecords(): Promise<ServiceRequest[]> {
  const open311 = new Open311(process.env.LEGACY_311_ENDPOINT);
  return open311.requests();
}

function upload(records: ServiceRequest[]): Promise<BulkResponse> {
  const searchBox = new SearchBox(process.env.SEARCHBOX_URL);
  return searchBox.createCases(records);
}

((async function searchBoxLoad() {
  const records = await loadRecords();

  console.info(`DOWNLOADED ${records.length} CASES`);

  const result = await upload(records);

  console.info(`UPLOADED ${result.took} CASES`);
}()).catch((err) => {
  console.error(err);
  process.exit(1);
}));
