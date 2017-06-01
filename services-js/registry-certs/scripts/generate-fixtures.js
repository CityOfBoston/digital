// @flow
/* eslint no-console: 0 */

import 'isomorphic-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { makeRegistryFactory } from '../server/services/Registry';

dotenv.config();

const FIXTURE_SEARCHES = ['smith'];

((async function generateFixtures() {
  const registryFactoryOpts = {
    user: process.env.REGISTRY_DB_USER,
    password: process.env.REGISTRY_DB_PASSWORD,
    domain: process.env.REGISTRY_DB_DOMAIN,
    server: process.env.REGISTRY_DB_SERVER,
    database: process.env.REGISTRY_DB_DATABASE,
  };

  const registryFactory = await makeRegistryFactory(registryFactoryOpts);
  const registry = registryFactory.registry();

  await Promise.all(FIXTURE_SEARCHES.map(async (search) => {
    const records = await registry.search(search, 0, 500);
    fs.writeFileSync(path.join(__dirname, `../fixtures/registry/${search}.json`), JSON.stringify(records, null, 2));
  }));

  await registryFactory.cleanup();
}()).catch((err) => {
  console.error(err);
  process.exit(1);
}));
