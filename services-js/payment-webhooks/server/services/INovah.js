// @flow

import soap from 'soap';
import Boom from 'boom';

type Opbeat = $Exports<'opbeat'>;

export type SoapCallback<T> = (
  err: ?Error,
  result: T,
  raw: any,
  soapHeader: Object,
) => void;

export type RegisterSecurityKeyInput = {|
  'strSignOnUserName': string,
  'strPassword': string,
|};

export type StandardResult<R> = {|
  StandardResult: {|
    Result: FailureResult | R,
  |},
|};

export type FailureResult = {|
  ReturnCode: 'Failure',
  ErrorType: string,
  ShortErrorMessage: string,
  LongErrorMessage: string,
  StatusInfo: null,
|};

export type SuccessResult = {|
  ReturnCode: 'Success',
  ErrorType: string,
  ShortErrorMessage: null,
  LongErrorMessage: null,
  StatusInfo: ?string,
|};

type PaymentAllocationIn = {|
  AllocationCode: string,
  // decimal string: 0.0000
  Amount: string,
|};

type PaymentAllocation = {|
  ...PaymentAllocationIn,
  TransactionID: string,
  // numeric string
  PaymentSequence: string,
  // numeric string
  AllocationSequence: string,
  AllocationName: string,
  // decimal string: 1.000000
  Quantity: string,
  GLAccount: string,
  GLDepartment: string,
  GLCode: string,
  GLDescription: string,
  AllocationID: string,
  UserDefined10: string,
  UserDefined11: string,
  // decimal string: 0.0000
  UnitCharge: string,
|};

type PaymentIn = {|
  PaymentCode: string,
  PaymentAllocation: PaymentAllocationIn,
|};

type Payment = {|
  ...PaymentIn,
  TransactionID: string,
  // numeric string
  PaymentSequence: string,
  ReceiptNumber: string,
  PaymentName: string,
  // decimal string: 0.0000
  PaymentTotal: string,
  // decimal string: 0.0000
  CurrentAmountDue: string,
  // decimal string: 0.0000
  PastAmountDue: string,
  // decimal string: 0.0000
  TotalAmountDue: string,
  BusinessFlag: 'true' | 'false',
  InquiryPerformed: 'true' | 'false',
  BusinessUnit: string,
  AccountsReceivable: 'true' | 'false',
  PaymentCustom: {|
    TransactionID: string,
    // numeric string
    PaymentSequence: string,
  |},
  PaymentAllocation: PaymentAllocation,
|};

type TenderIn = {|
  // decimal string: 0.0000
  Amount: string,
  TenderCode: string,
|};

type Tender = {|
  ...TenderIn,
  TransactionID: string,
  // numeric string
  TenderSequence: string,
  TenderName: string,
  Depositable: 'true' | 'false',
  Itemized: 'true' | 'false',
  BankID: string,
  TenderType: string,
  // decimal string: 0.0000
  NativeAmount: string,
  // decimal string: 1.000000
  ExchangeRate: string,
  UserDefined4: string,
  UserDefined5: string,
  TenderID: string,
  // ISO 8601 string: 2011-11-09T09:35:44.243-05:00
  ReferenceDate: string,
|};

type TransactionIn = {|
  // enforcing this at the type level
  Payment: PaymentIn,
  Tender: TenderIn,
|};

type Transaction = {|
  ...TransactionIn,
  PaymentBatchID: string,
  TransactionID: string,
  // numeric string
  TransactionNum: string,
  TransactionStatus: string,
  MachineID: string,
  Company: string,
  Department: string,
  // ISO 8601 string: 2011-11-09T09:35:44.243-05:00
  EntryTimeStamp: string,
  // ISO 8601 string: 2011-11-09T09:35:44.243-05:00
  DateReceived: string,
  CollectionPoint: string,
  // decimal string: 0.0000
  TransactionTotal: string,
  // ISO 8601 string: 2011-11-09T09:35:44.243-05:00
  StartTime: string,
  Server: string,
  Payment: Payment,
  Tender: Tender,
|};

type PaymentBatch = {|
  PaymentBatchID: string,
  // numeric string
  PaymentBatchNum: string,
  OfficeCode: string,
  OwnerName: string,
  // ISO 8601 string: 2011-11-09T09:35:44.243-05:00
  OpenedTimeStamp: string,
  // ISO 8601 string: 2011-11-09T09:35:44.243-05:00
  BatchDate: string,
  PaymentOrigin: string,
  BatchStatus: string,
  // decimal string: 0.0000
  BatchDepositTotal: string,
  // decimal string: 0.0000
  BatchTransactionTotal: string,
  // decimal string: 0.0000
  BatchOverShortTotal: string,
  // decimal string: 0.0000
  BatchFloat: string,
  BatchActionReason: string,
  Transaction: Transaction,
|};

export type AddTransactionInput = {|
  strSecurityKey: string,
  strPaymentOrigin: string,
  xmlTransaction: {
    Transaction: {
      attributes: {
        xmlns: '',
      },
      ...TransactionIn,
    },
  },
|};

export type AddTransactionResult = {|
  ...SuccessResult,
  VoidTransactionData: null,
  VoidingTransactionData: null,
  UnvoidedCreditCards: 'true' | 'false',
  PaymentBatch: PaymentBatch,
|};

export type AddTransactionOutput = {|
  AddTransactionResult: StandardResult<AddTransactionResult>,
|};

export type RegisterSecurityKeyResult = {|
  ...SuccessResult,
  SecurityKey: string,
|};

export type RegisterSecurtyKeyOutput = {|
  RegisterSecurityKeyResult: StandardResult<RegisterSecurityKeyResult>,
|};

export interface INovahClient {
  describe(): Object,
  AddTransaction(
    input: AddTransactionInput,
    cb: SoapCallback<AddTransactionOutput>,
  ): void,
  RegisterSecurityKey(
    input: RegisterSecurityKeyInput,
    cb: SoapCallback<RegisterSecurtyKeyOutput>,
  ): void,
}

export default class INovah {
  endpoint: string;
  username: string;
  password: string;
  paymentOrigin: string;
  opbeat: Opbeat;

  constructor(
    endpoint: ?string,
    username: ?string,
    password: ?string,
    paymentOrigin: ?string,
    opbeat: Opbeat,
  ) {
    if (!endpoint) {
      throw new Error('Must specify INOVAH_ENDPOINT');
    }

    if (!username) {
      throw new Error('Must specify INOVAH_USERNAME');
    }

    if (!password) {
      throw new Error('Must specify INOVAH_PASSWORD');
    }

    if (!paymentOrigin) {
      throw new Error('Must specify INOVAH_PAYMENT_ORIGIN');
    }

    this.endpoint = endpoint;
    this.username = username;
    this.password = password;
    this.paymentOrigin = paymentOrigin;
    this.opbeat = opbeat;
  }

  makeClient(): Promise<INovahClient> {
    const wsdlUrl = `${this.endpoint}?WSDL`;
    return new Promise((resolve, reject) => {
      const options = {
        connection: 'keep-alive',
      };

      soap.createClient(wsdlUrl, options, (err, client) => {
        if (err) {
          reject(err);
        } else {
          resolve(client);
        }
      });
    });
  }

  async describe(): Promise<Object> {
    const client = await this.makeClient();
    return client.describe();
  }

  getSecurityKey(client: INovahClient): Promise<string> {
    return new Promise((resolve, reject) => {
      client.RegisterSecurityKey(
        {
          strSignOnUserName: this.username,
          strPassword: this.password,
        },
        (err, output: RegisterSecurtyKeyOutput) => {
          if (err) {
            reject(err);
          } else {
            const result =
              output.RegisterSecurityKeyResult.StandardResult.Result;

            switch (result.ReturnCode) {
              case 'Failure':
                reject(Boom.unauthorized(result.LongErrorMessage));
                break;

              case 'Success':
                resolve(result.SecurityKey);
                break;
            }
          }
        },
      );
    });
  }

  async registerSecurityKey(): Promise<string> {
    return this.getSecurityKey(await this.makeClient());
  }

  async addTransaction(amount: number): Promise<string> {
    const client = await this.makeClient();
    const securityKey = await this.getSecurityKey(client);

    return new Promise((resolve, reject) => {
      client.AddTransaction(
        {
          strSecurityKey: securityKey,
          strPaymentOrigin: this.paymentOrigin,
          xmlTransaction: {
            Transaction: {
              attributes: {
                xmlns: '',
              },
              Payment: {
                PaymentCode: 'REG13',
                PaymentAllocation: {
                  AllocationCode: 'REG13',
                  Amount: amount.toFixed(4),
                },
              },
              Tender: {
                TenderCode: 'CASH',
                Amount: amount.toFixed(4),
              },
            },
          },
        },
        (err, output: AddTransactionOutput) => {
          if (err) {
            reject(err);
          } else {
            const result = output.AddTransactionResult.StandardResult.Result;

            switch (result.ReturnCode) {
              case 'Failure':
                reject(Boom.badData(result.LongErrorMessage));
                break;

              case 'Success':
                resolve(result.PaymentBatch.Transaction.TransactionID);
                break;
            }
          }
        },
      );
    });
  }
}
