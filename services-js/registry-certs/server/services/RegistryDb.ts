import { ConnectionPool, IResult } from 'mssql';
import {
  DatabaseConnectionOptions,
  createConnectionPool,
} from '@cityofboston/mssql-common';

import fs from 'fs';
import { promisify } from 'util';
import DataLoader from 'dataloader';
import Rollbar from 'rollbar';
import RegistryDbFake from './RegistryDbFake';

const readFile = promisify(fs.readFile);

export enum OrderType {
  DeathCertificate = 'DC',
  BirthCertificate = 'BC',
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

export interface BirthCertificate {
  CertificatesID: number;
  'Registered Number': string;
  InOut: boolean;
  'Date of Birth': string;
  'Certificate Name': string;
  'Last Name': string;
  'First Name': string;
  RegisteredYear: string;
  Impounded: boolean;
}

export interface AddOrderOptions {
  orderID: string;
  orderDate: Date;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  shippingName: string;
  shippingCompany: string;
  shippingAddr1: string;
  shippingAddr2: string;
  shippingCity: string;
  shippingState: string;
  shippingZIP: string;
  billingName: string;
  billingAddr1: string;
  billingAddr2: string;
  billingCity: string;
  billingState: string;
  billingZIP: string;
  billingLast4: string;
  serviceFee: number;
  idempotencyKey: string;
}

export interface AddOrderResult {
  OrderKey: number;
  ErrorMessage: string;
}

export interface FindOrderResult {
  OrderKey: number;
  OrderType: string;
  OrderDate: string;
  OrderStatus: string;
  ProcessDtTm: string | null;
  ContactName: string;
  ContactEmail: string;
  ContactPhone: string;
  ShippingName: string;
  ShippingCompany: string;
  ShippingAddr1: string;
  ShippingAddr2: string;
  ShippingCity: string;
  ShippingState: string;
  ShippingZIP: string;
  BillingName: string;
  BillingAddr1: string;
  BillingAddr2: string;
  BillingCity: string;
  BillingState: string;
  BillingZIP: string;
  CertificateIDs: string;
  CertificateQuantities: string;
  CertificateCost: number;
  ServiceFee: number;
  TotalCost: number;
}

export interface BirthCertificateRequestArgs {
  certificateLastName: string;
  certificateFirstName: string;
  alternativeSpellings: string;
  dateOfBirth: Date;
  parent1LastName: string;
  parent1FirstName: string;
  parent2LastName: string;
  parent2FirstName: string;
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

export default class RegistryDb {
  private pool: ConnectionPool;
  private lookupDeathCertificateLoader: DataLoader<
    string,
    DeathCertificate | null
  >;

  constructor(pool: ConnectionPool) {
    this.pool = pool;
    this.lookupDeathCertificateLoader = new DataLoader(keys =>
      this.lookupDeathCertificateLoaderFetch(keys)
    );
  }

  async searchDeathCertificates(
    name: string,
    page: number,
    pageSize: number,
    startYear: string | null | undefined,
    endYear: string | null | undefined
  ): Promise<Array<DeathCertificateSearchResult>> {
    const resp: IResult<DeathCertificateSearchResult> = (await this.pool
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

  async lookupDeathCertificate(id: string): Promise<DeathCertificate | null> {
    return this.lookupDeathCertificateLoader.load(id);
  }

  // "any" here is really DeathCertificate | null | Error
  private async lookupDeathCertificateLoaderFetch(
    keys: Array<string>
  ): Promise<Array<any>> {
    // The api can only take 1000 characters of keys at once. We probably won't
    // run into that issue but just in case we split up and parallelize.
    const keyStrings = splitKeys(MAX_ID_LOOKUP_LENGTH, keys);

    const idToOutputMap: {
      [key: string]: DeathCertificate | null | Error;
    } = {};

    const allResults: Array<Array<DeathCertificate>> = await Promise.all(
      keyStrings.map(async keyString => {
        try {
          const resp: IResult<DeathCertificate> = (await this.pool
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

  async addOrder(
    orderType: OrderType,
    {
      orderID,
      orderDate,
      contactName,
      contactEmail,
      contactPhone,
      shippingName,
      shippingCompany,
      shippingAddr1,
      shippingAddr2,
      shippingCity,
      shippingState,
      shippingZIP,
      billingName,
      billingAddr1,
      billingAddr2,
      billingCity,
      billingState,
      billingZIP,
      billingLast4,
      serviceFee,
      idempotencyKey,
    }: AddOrderOptions
  ): Promise<number> {
    const resp: IResult<AddOrderResult> = await this.pool
      .request()
      .input('orderID', orderID)
      .input('orderType', orderType)
      .input('orderDate', orderDate)
      .input('contactName', contactName)
      .input('contactEmail', contactEmail)
      .input('contactPhone', contactPhone)
      .input('shippingName', shippingName)
      .input('shippingCompany', shippingCompany)
      .input('shippingAddr1', shippingAddr1)
      .input('shippingAddr2', shippingAddr2)
      .input('shippingCity', shippingCity)
      .input('shippingState', shippingState)
      .input('shippingZIP', shippingZIP)
      .input('billingName', billingName)
      .input('billingAddr1', billingAddr1)
      .input('billingAddr2', billingAddr2)
      .input('billingCity', billingCity)
      .input('billingState', billingState)
      .input('billingZIP', billingZIP)
      .input('billingLast4', billingLast4)
      .input('serviceFee', `$${serviceFee.toFixed(2)}`)
      .input('idempotencyKey', idempotencyKey)
      .execute('Commerce.sp_AddOrder');

    const { recordset } = resp;

    if (!recordset || recordset.length === 0) {
      throw new Error('Recordset for creating an order came back empty');
    }

    const result = recordset[0];

    if (result.ErrorMessage) {
      throw new Error(result.ErrorMessage);
    }

    return result.OrderKey;
  }

  async addDeathCertificateItem(
    orderKey: number,
    certificateId: number,
    certificateName: string,
    quantity: number,
    certificateCost: number
  ): Promise<void> {
    const resp: IResult<Object> = await this.pool
      .request()
      .input('orderKey', orderKey)
      .input('orderType', OrderType.DeathCertificate)
      .input('certificateID', certificateId)
      .input('certificateName', certificateName)
      .input('quantity', quantity)
      .input('unitCost', `$${certificateCost.toFixed(2)}`)
      .execute('Commerce.sp_AddOrderItem');

    const { recordset } = resp;

    if (!recordset || recordset.length === 0) {
      throw new Error(
        `Could not add item to order ${orderKey}. Likely no certificate ID ${certificateId} in the database.`
      );
    }
  }

  async addBirthCertificateRequest(
    orderKey: number,
    {
      certificateFirstName,
      certificateLastName,
      alternativeSpellings,
      dateOfBirth,
      parent1FirstName,
      parent1LastName,
      parent2FirstName,
      parent2LastName,
    }: BirthCertificateRequestArgs,
    quantity: number,
    certificateCost: number
  ): Promise<number> {
    const resp: IResult<{
      RequestItemKey: number;
      ErrorMessage: string;
    }> = await this.pool
      .request()
      .input('orderKey', orderKey)
      .input('orderType', OrderType.BirthCertificate)
      .input('certificateLastName', certificateLastName)
      .input('certificateFirstName', certificateFirstName)
      .input('alternativeSpellings', alternativeSpellings)
      .input('dateOfBirth', dateOfBirth)
      .input('parent1LastName', parent1LastName)
      .input('parent1FirstName', parent1FirstName)
      .input('parent2LastName', parent2LastName)
      .input('parent2FirstName', parent2FirstName)
      .input('quantity', quantity)
      .input('unitCost', `$${certificateCost.toFixed(2)}`)
      .execute('Commerce.sp_AddBirthRequest');

    const { recordset } = resp;

    if (!recordset || recordset.length === 0) {
      throw new Error(`Could not add birth request to ${orderKey}.`);
    }

    if (recordset[0].ErrorMessage) {
      throw new Error(recordset[0].ErrorMessage);
    }

    return recordset[0].RequestItemKey;
  }

  async addPayment(
    orderKey: number,
    paymentDate: Date,
    transactionId: string,
    totalInDollars: number
  ): Promise<void> {
    const resp: IResult<Object> = await this.pool
      .request()
      .input('orderKey', orderKey)
      .input('paymentDate', paymentDate)
      .input('paymentDescription', '')
      .input('transactionID', transactionId)
      .input('paymentAmount', `$${totalInDollars.toFixed(2)}`)
      .execute('Commerce.sp_AddPayment');

    const { recordset } = resp;

    if (!recordset || recordset.length === 0) {
      throw new Error('Recordset for adding payment came back empty');
    }
  }

  async findOrder(orderId: string): Promise<FindOrderResult | null> {
    const resp: IResult<FindOrderResult> = await this.pool
      .request()
      .input('orderID', orderId)
      .execute('Commerce.sp_FindOrder');

    const { recordset } = resp;

    if (!recordset || recordset.length === 0) {
      return null;
    }

    return recordset[0];
  }

  async cancelOrder(orderKey: number, reason: string): Promise<void> {
    await this.pool
      .request()
      .input('orderKey', orderKey)
      .input('reason', reason)
      .execute('Commerce.sp_CancelOrder');
  }
}

export class RegistryDbFactory {
  protected pool: ConnectionPool;

  constructor(pool: ConnectionPool) {
    this.pool = pool;
  }

  registryDb() {
    return new RegistryDb(this.pool);
  }

  cleanup(): Promise<any> {
    return this.pool.close();
  }
}

export async function makeRegistryDbFactory(
  rollbar: Rollbar,
  connectionOptions: DatabaseConnectionOptions
): Promise<RegistryDbFactory> {
  const pool = await createConnectionPool(connectionOptions, err =>
    rollbar.error(err)
  );
  return new RegistryDbFactory(pool);
}

export async function makeFixtureRegistryDbFactory(
  fixtureName: string
): Promise<Required<RegistryDbFactory>> {
  const fixtureData = await readFile(fixtureName);
  const json = JSON.parse(fixtureData.toString('utf-8'));

  return {
    registryDb() {
      return new RegistryDbFake(json) as any;
    },

    cleanup() {
      return Promise.resolve(null);
    },
  };
}
