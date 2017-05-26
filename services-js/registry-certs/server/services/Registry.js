// @flow

import { ConnectionPool } from 'mssql';

import fs from 'fs';

export type SearchResult = {
  CertificateID: number,
  'Registered Number': string,
  InOut: 'I' | '*' | '#',
  'Date of Death': string,
  'Decedent Name': string,
  'Last Name': string,
  'First Name': string,
  RegisteredYear: string,
  AgeOrDateOfBirth: string,
  ResultCount: number,
};

export default class Registry {
  pool: ConnectionPool;

  constructor(pool: ConnectionPool) {
    this.pool = pool;
  }

  async search(name: string, page: number, pageSize: number): Promise<Array<SearchResult>> {
    const resp = await this.pool.request()
      .input('searchFor', name)
      .input('pageNumber', page)
      .input('pageSize', pageSize)
      .execute('Registry.Death.sp_FindCertificatesWeb');

    const { recordset } = resp;

    if (!recordset) {
      throw new Error('Recordset for search came back empty');
    }

    return recordset;
  }

  // eslint-disable-next-line no-unused-vars
  async lookup(id: string): Promise<?SearchResult> {
    return null;
  }
}

export class RegistryFactory {
  pool: ConnectionPool;

  constructor(pool: ConnectionPool) {
    this.pool = pool;
  }

  registry() {
    return new Registry(this.pool);
  }

  cleanup(): Promise<any> {
    return this.pool.close();
  }
}

export type MakeRegistryOptions = {|
  user: ?string,
  password: ?string,
  server: ?string,
  domain: ?string,
  database: ?string,
|}

export async function makeRegistryFactory({ user, password, server, domain, database }: MakeRegistryOptions): Promise<RegistryFactory> {
  if (!(user && password && server && domain && database)) {
    throw new Error('Missing some element of database configuration');
  }

  const pool = new ConnectionPool({
    user,
    password,
    server,
    domain,
    database,
    pool: {
      min: 1,
    },
    options: {
      encrypt: true,
    },
  });

  await pool.connect();

  return new RegistryFactory(pool);
}

export class FixtureRegistry {
  data: Array<SearchResult>;

  constructor(data: Array<SearchResult>) {
    this.data = data;
  }

  async search(query: string, page: number, pageSize: number): Promise<Array<SearchResult>> {
    return this.data.slice(page * pageSize, (page + 1) * pageSize);
  }

  async lookup(id: string): Promise<?SearchResult> {
    return this.data.find((res) => res.CertificateID.toString() === id);
  }
}

export function makeFixtureRegistryFactory(fixtureName: string): Promise<RegistryFactory> {
  return new Promise((resolve, reject) => {
    fs.readFile(fixtureName, (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const json = JSON.parse(data.toString('utf-8'));

          resolve(({
            registry() {
              return new FixtureRegistry(json);
            },

            cleanup() {
              return Promise.resolve(null);
            },
          }: any));
        } catch (e) {
          reject(e);
        }
      }
    });
  });
}
