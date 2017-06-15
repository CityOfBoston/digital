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
  StatusInfo: string,
|};

export type AddTransactionInput = {|
  strSecurityKey: string,
  strPaymentOrigin: string,
  xmlTransaction: Object,
|};

export type AddTransactionResult = {|
  ...SuccessResult,
|};

export type AddTransactionOutput = {|
  AddTransactionResult: StandardResult<AddTransactionResult>,
|};

export type PerformInquiryInput = {|
  strSecurityKey: string,
  strPaymentOrigin: string,
  xmlTransaction: Object,
|};

export type PerformInquiryResult = {|
  ...SuccessResult,
|};

export type PerformInquiryOutput = {|
  PerformInquiryResult: StandardResult<PerformInquiryResult>,
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
  PerformInquiry(
    input: PerformInquiryInput,
    cb: SoapCallback<PerformInquiryOutput>,
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
  opbeat: Opbeat;

  constructor(
    endpoint: ?string,
    username: ?string,
    password: ?string,
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

    this.endpoint = endpoint;
    this.username = username;
    this.password = password;
    this.opbeat = opbeat;
  }

  makeClient(): Promise<INovahClient> {
    const wsdlUrl = `${this.endpoint}?WSDL`;
    return new Promise((resolve, reject) => {
      const options = {connection: 'keep-alive'};
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

  async inquire(paymentOrigin: string): Promise<string> {
    const client = await this.makeClient();
    const securityKey = await this.getSecurityKey(client);

    return new Promise((resolve, reject) => {
      client.PerformInquiry(
        {
          strSecurityKey: securityKey,
          strPaymentOrigin: paymentOrigin,
          xmlTransaction: {
            Transaction: {
              TransactionNum: '3',
            },
          },
        },
        (err, output: PerformInquiryOutput) => {
          if (err) {
            reject(err);
          } else {
            resolve(JSON.stringify(output, null, 2));
          }
        },
      );
    });
  }

  async addTransaction(paymentOrigin: string, amount: number): Promise<string> {
    const client = await this.makeClient();
    const securityKey = await this.getSecurityKey(client);

    return new Promise((resolve, reject) => {
      client.AddTransaction(
        {
          strSecurityKey: securityKey,
          strPaymentOrigin: paymentOrigin,
          xmlTransaction: {
            Transaction: {
              Payment: {
                PaymentCode: 'REG13',
                AccountNumber: '111111111',
                PaymentAllocation: {
                  AllocationCode: 'REG13',
                  Amount: amount,
                },
              },
              Tender: {
                TenderCode: 'CASH',
                Amount: amount,
              },
            },
          },
        },
        (err, output: AddTransactionOutput) => {
          if (err) {
            reject(err);
          } else {
            resolve(JSON.stringify(output, null, 2));
          }
        },
      );
    });
  }
}
