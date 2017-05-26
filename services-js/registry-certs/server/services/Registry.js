// @flow

import { ConnectionPool } from 'mssql';

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
