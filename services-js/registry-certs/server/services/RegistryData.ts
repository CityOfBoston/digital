// @flow

import { ConnectionPool } from 'mssql';

import fs from 'fs';
import DataLoader from 'dataloader';
import Rollbar from 'rollbar';

import {
  createConnectionPool,
  DatabaseConnectionOptions,
} from '../lib/mssql-helpers';

interface DbResponse<R> {
  recordsets: Array<Array<R>>;
  recordset: Array<R>;
  output: Object;
  rowsAffected: Array<number>;
}

export interface DeathCertificate {
  CertificateID: number;
  'Registered Number': string;
  InOut: 'I' | '*' | '#';
  'Date of Death': string | null;
  'Decedent Name': string;
  'Last Name': string;
  'First Name': string;
  RegisteredYear: string;
  AgeOrDateOfBirth: string;
  Pending: number;
}

export interface DeathCertificateSearchResult extends DeathCertificate {
  ResultCount: number;
}

const MAX_ID_LOOKUP_LENGTH = 1000;

// Converts a list of key strings into an array of comma-separated strings,
// each no longer than maxLength.
//
// E.g.: ["12345", "67890", "abcde"] => ["12345,67890", "abcde"]
export function splitKeys(
  maxLength: number,
  keys: Array<string>
): Array<string> {
  const keyStrings: Array<string> = [];
  let currentKeyString = '';

  keys.forEach(key => {
    if (currentKeyString.length === 0) {
      currentKeyString = key;
    } else if (currentKeyString.length + key.length + 1 < maxLength) {
      currentKeyString = `${currentKeyString},${key}`;
    } else {
      keyStrings.push(currentKeyString);
      currentKeyString = key;
    }
  });

  if (currentKeyString.length > 0) {
    keyStrings.push(currentKeyString);
  }

  return keyStrings;
}

export default class RegistryData {
  protected pool: ConnectionPool;
  protected lookupLoader: DataLoader<string, DeathCertificate | null>;

  constructor(pool: ConnectionPool) {
    this.pool = pool;
    this.lookupLoader = new DataLoader(keys => this.lookupLoaderFetch(keys));
  }

  async search(
    name: string,
    page: number,
    pageSize: number,
    startYear: string | null | undefined,
    endYear: string | null | undefined
  ): Promise<Array<DeathCertificateSearchResult>> {
    const resp: DbResponse<DeathCertificateSearchResult> = (await this.pool
      .request()
      .input('searchFor', name)
      .input('pageNumber', page)
      .input('pageSize', pageSize)
      .input('sortBy', 'dateOfDeath')
      .input('startYear', startYear)
      .input('endYear', endYear)
      .execute('Registry.Death.sp_FindCertificatesWeb')) as any;

    const { recordset } = resp;

    if (!recordset) {
      throw new Error('Recordset for search came back empty');
    }

    return recordset;
  }

  async lookup(id: string): Promise<DeathCertificate | null> {
    return this.lookupLoader.load(id);
  }

  // "any" here is really DeathCertificate | null | Error
  protected async lookupLoaderFetch(keys: Array<string>): Promise<Array<any>> {
    // The api can only take 1000 characters of keys at once. We probably won't
    // run into that issue but just in case we split up and parallelize.
    const keyStrings = splitKeys(MAX_ID_LOOKUP_LENGTH, keys);

    const idToOutputMap: {
      [key: string]: DeathCertificate | null | Error;
    } = {};

    const allResults: Array<Array<DeathCertificate>> = await Promise.all(
      keyStrings.map(async keyString => {
        try {
          const resp: DbResponse<DeathCertificate> = (await this.pool
            .request()
            .input('idList', keyString)
            .execute('Registry.Death.sp_GetCertificatesWeb')) as any;

          return resp.recordset;
        } catch (err) {
          keyString.split(',').forEach(id => (idToOutputMap[id] = err));
          return [];
        }
      })
    );

    allResults.forEach(results => {
      results.forEach((cert: DeathCertificate) => {
        idToOutputMap[cert.CertificateID.toString()] = cert;
      });
    });

    return keys.map(k => idToOutputMap[k]);
  }
}

export class RegistryDataFactory {
  protected pool: ConnectionPool;

  constructor(pool: ConnectionPool) {
    this.pool = pool;
  }

  registryData() {
    return new RegistryData(this.pool);
  }

  cleanup(): Promise<any> {
    return this.pool.close();
  }
}

export async function makeRegistryDataFactory(
  rollbar: Rollbar,
  connectionOptions: DatabaseConnectionOptions
): Promise<RegistryDataFactory> {
  const pool = await createConnectionPool(rollbar, connectionOptions);
  return new RegistryDataFactory(pool);
}

export class FixtureRegistryData implements Required<RegistryData> {
  data: Array<DeathCertificateSearchResult>;

  constructor(data: Array<DeathCertificateSearchResult>) {
    this.data = data;
  }

  async search(
    _query: string,
    page: number,
    pageSize: number
  ): Promise<Array<DeathCertificateSearchResult>> {
    return this.data.slice(page * pageSize, (page + 1) * pageSize);
  }

  async lookup(id: string): Promise<DeathCertificate | null> {
    return this.data.find(res => res.CertificateID.toString() === id)!;
  }
}

export function makeFixtureRegistryDataFactory(
  fixtureName: string
): Promise<RegistryDataFactory> {
  return new Promise((resolve, reject) => {
    fs.readFile(fixtureName, (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const json = JSON.parse(data.toString('utf-8'));

          resolve({
            registryData() {
              return new FixtureRegistryData(json);
            },

            cleanup() {
              return Promise.resolve(null);
            },
          } as any);
        } catch (e) {
          reject(e);
        }
      }
    });
  });
}
