// @flow
/* eslint no-console: 0 */

import 'isomorphic-fetch';
import dotenv from 'dotenv';

import Open311 from '../server/services/Open311';
import Swiftype from '../server/services/Swiftype';
import type { ServiceRequest } from '../server/services/Open311';

dotenv.config();

function loadRecords(): Promise<ServiceRequest[]> {
  const open311 = new Open311(process.env.LEGACY_311_ENDPOINT);
  return open311.requests();
}

function uploadToSwiftype(records: ServiceRequest[]): Promise<boolean[]> {
  const swiftype = new Swiftype(process.env.SWIFTYPE_API_KEY, process.env.SWIFTYPE_ENGINE_SLUG);
  return swiftype.createCases(records);
}

((async function swiftypeLoad() {
  const records = await loadRecords();

  console.info(`DOWNLOADED ${records.length} CASES`);

  const oks = await uploadToSwiftype(records);

  console.info(`UPLOADED ${oks.filter((b) => b).length} CASES`);
}()).catch((err) => {
  console.error(err);
  process.exit(1);
}));
