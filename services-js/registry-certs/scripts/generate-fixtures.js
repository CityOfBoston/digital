// @flow
/* eslint no-console: 0 */

import 'isomorphic-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { makeRegistryDataFactory } from '../server/services/RegistryData';

dotenv.config();

const FIXTURE_SEARCHES = ['smith'];

(async function generateFixtures() {
  const registryFactoryOpts = {
    user: process.env.REGISTRY_DB_USER,
    password: process.env.REGISTRY_DB_PASSWORD,
    domain: process.env.REGISTRY_DB_DOMAIN,
    server: process.env.REGISTRY_DB_SERVER,
    database: process.env.REGISTRY_DB_DATABASE,
  };

  const registryDataFactory = await makeRegistryDataFactory(
    (null: any),
    registryFactoryOpts
  );
  const registryData = registryDataFactory.registryData();

  await Promise.all(
    FIXTURE_SEARCHES.map(async search => {
      const records = await registryData.search(search, 0, 500);
      fs.writeFileSync(
        path.join(__dirname, `../fixtures/registry-data/${search}.json`),
        JSON.stringify(records, null, 2)
      );
    })
  );

  await registryDataFactory.cleanup();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
