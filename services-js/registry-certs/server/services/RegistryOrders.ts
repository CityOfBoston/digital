// @flow
/* eslint no-console: 0 */

import { ConnectionPool } from 'mssql';
import Rollbar from 'rollbar';

import {
  createConnectionPool,
  DatabaseConnectionOptions,
  DbResponse,
} from '../lib/mssql-helpers';

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

export default class RegistryOrders {
  protected pool: ConnectionPool;

  constructor(pool: ConnectionPool) {
    this.pool = pool;
  }

  async addOrder({
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
  }: AddOrderOptions): Promise<number> {
    const resp: DbResponse<AddOrderResult> = await this.pool
      .request()
      .input('orderID', orderID)
      .input('orderType', 'DC')
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

  async addItem(
    orderKey: number,
    certificateId: number,
    certificateName: string,
    quantity: number,
    certificateCost: number
  ): Promise<void> {
    const resp: DbResponse<Object> = await this.pool
      .request()
      .input('orderKey', orderKey)
      .input('orderType', 'DC')
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

  async addPayment(
    orderKey: number,
    paymentDate: Date,
    transactionId: string,
    totalInDollars: number
  ): Promise<void> {
    const resp: DbResponse<Object> = await this.pool
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
    const resp: DbResponse<FindOrderResult> = await this.pool
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

export class RegistryOrdersFactory {
  protected pool: ConnectionPool;

  constructor(pool: ConnectionPool) {
    this.pool = pool;
  }

  registryOrders(): RegistryOrders {
    return new RegistryOrders(this.pool);
  }

  cleanup(): Promise<any> {
    return this.pool.close();
  }
}

export async function makeRegistryOrdersFactory(
  rollbar: Rollbar,
  connectionOptions: DatabaseConnectionOptions
): Promise<RegistryOrdersFactory> {
  const pool = await createConnectionPool(rollbar, connectionOptions);
  return new RegistryOrdersFactory(pool);
}

export class FixtureRegistryOrders {
  async addOrder(): Promise<number> {
    return 50;
  }

  async addItem(): Promise<void> {}
  async addPayment(): Promise<void> {}

  async findOrder(): Promise<FindOrderResult | null> {
    const orderFixture = require('../../fixtures/registry-orders/order.json');
    return orderFixture;
  }

  async cancelOrder(): Promise<void> {}
}

export async function makeFixtureRegistryOrdersFactory(): Promise<
  Required<RegistryOrdersFactory>
> {
  return {
    registryOrders() {
      return new FixtureRegistryOrders() as any;
    },

    async cleanup(): Promise<void> {},
  };
}
