/* eslint no-console: 0 */
import fs from 'fs';
import dotenv from 'dotenv';

import { toTypeScript } from '@cityofboston/mssql-typescript';

dotenv.config();

(async function go() {
  const username = process.env.COMMISSIONS_DB_USERNAME;
  const password = process.env.COMMISSIONS_DB_PASSWORD;
  const database = process.env.COMMISSIONS_DB_DATABASE;
  const domain = process.env.COMMISSIONS_DB_DOMAIN;
  const serverName = process.env.COMMISSIONS_DB_SERVER;

  if (!username) {
    throw new Error('Must specify COMMISSIONS_DB_USERNAME');
  }

  if (!password) {
    throw new Error('Must specify COMMISSIONS_DB_PASSWORD');
  }

  if (!database) {
    throw new Error('Must specify COMMISSIONS_DB_DATABASE');
  }

  if (!serverName) {
    throw new Error('Must specify COMMISSIONS_DB_SERVER');
  }

  const ts = await toTypeScript({
    user: username,
    password,
    database,
    server: serverName,
    domain,
  });

  fs.writeFileSync('./src/server/dao/CommissionsDb.d.ts', ts, 'utf-8');
})().catch(err => {
  console.error(err);
  process.exit(-1);
});
