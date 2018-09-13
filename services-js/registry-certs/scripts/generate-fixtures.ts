/* eslint no-console: 0 */

import 'isomorphic-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import faker from 'faker';

import { makeRegistryDataFactory } from '../server/services/RegistryData';

dotenv.config();

const FIXTURE_SEARCHES = ['smith'];

(async function generateFixtures() {
  const registryFactoryOpts = {
    user: process.env.REGISTRY_DATA_DB_USER,
    password: process.env.REGISTRY_DATA_DB_PASSWORD,
    domain: undefined,
    server: process.env.REGISTRY_DATA_DB_SERVER,
    database: process.env.REGISTRY_DATA_DB_DATABASE,
  };

  const registryDataFactory = await makeRegistryDataFactory(
    null as any,
    registryFactoryOpts
  );
  const registryData = registryDataFactory.registryData();

  await Promise.all(
    FIXTURE_SEARCHES.map(async search => {
      const records = await registryData.search(search, 0, 500, null, null);

      const cleanedRecords = records.map(r => {
        const firstName = faker.name.firstName().toUpperCase();
        const lastName = faker.name.lastName().toUpperCase();

        return {
          ...r,
          'First Name': firstName,
          'Last Name': lastName,
          'Decedent Name': `${firstName} ${lastName}`,
        };
      });

      fs.writeFileSync(
        path.join(__dirname, `../fixtures/registry-data/${search}.json`),
        JSON.stringify(cleanedRecords, null, 2)
      );
    })
  );

  await registryDataFactory.cleanup();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
