/* eslint no-console: 0 */

import 'isomorphic-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import faker from 'faker';

import { makeRegistryDbFactory } from '../server/services/RegistryDb';
import { DatabaseConnectionOptions } from '@cityofboston/mssql-common';

dotenv.config();

const FIXTURE_SEARCHES = ['smith'];

(async function generateFixtures() {
  const registryFactoryOpts: DatabaseConnectionOptions = {
    username: process.env.REGISTRY_DATA_DB_USER!,
    password: process.env.REGISTRY_DATA_DB_PASSWORD!,
    domain: undefined,
    server: process.env.REGISTRY_DATA_DB_SERVER,
    database: process.env.REGISTRY_DATA_DB_DATABASE,
  };

  const registryDbFactory = await makeRegistryDbFactory(
    null as any,
    registryFactoryOpts
  );
  const registryDb = registryDbFactory.registryDb();

  await Promise.all(
    FIXTURE_SEARCHES.map(async search => {
      const records = await registryDb.search(search, 0, 500, null, null);

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

  await registryDbFactory.cleanup();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
