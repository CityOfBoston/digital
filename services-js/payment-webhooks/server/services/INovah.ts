import Boom from 'boom';
import Rollbar from 'rollbar';

import { createSoapClient } from '../lib/soap-helpers';

type TransactionCustomer = {
  cardholderName: string;
  billingAddress1: string;
  billingAddress2: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
};

type TransactionPayment = {
  quantity: number;
  amountInDollars: number;
  unitPriceInDollars: number;
};

export type StandardResult<R> = {
  StandardResult: {
    Result: FailureResult | R;
  };
};

export interface FailureResult {
  ReturnCode: 'Failure';
  ErrorType: string;
  ShortErrorMessage: string;
  LongErrorMessage: string;
  StatusInfo: null;
}

export interface SuccessResult {
  ReturnCode: 'Success';
  ErrorType: string;
  ShortErrorMessage: null;
  LongErrorMessage: null;
  StatusInfo: string | undefined;
}

type PaymentAllocationIn = {
  AllocationCode: string;
  // decimal string: 0.0000
  Amount: string;
  // decimal string: 1.000000
  Quantity: string;
  // decimal string: 0.0000
  UnitCharge: string;
};

type PaymentAllocation = PaymentAllocationIn & {
  TransactionID: string;
  // numeric string
  PaymentSequence: string;
  // numeric string
  AllocationSequence: string;
  AllocationName: string;
  GLAccount: string;
  GLDepartment: string;
  GLCode: string;
  GLDescription: string;
  AllocationID: string;
  UserDefined10: string;
  UserDefined11: string;
};

type PaymentIn = {
  PaymentCode: string;
  PaymentAllocation: PaymentAllocationIn;
  LastName?: string;
  StreetName?: string;
  City?: string;
  State?: string;
  Zip?: string;
  Invoice?: string;
  PaymentCustom?: {
    AddressLine1?: string;
    AddressLine2?: string;
    AddressLine3?: string;
    UnstructuredName?: string;
  };
};

type Payment = PaymentIn & {
  TransactionID: string;
  // numeric string
  PaymentSequence: string;
  ReceiptNumber: string;
  PaymentName: string;
  // decimal string: 0.0000
  PaymentTotal: string;
  // decimal string: 0.0000
  CurrentAmountDue: string;
  // decimal string: 0.0000
  PastAmountDue: string;
  // decimal string: 0.0000
  TotalAmountDue: string;
  BusinessFlag: 'true' | 'false';
  InquiryPerformed: 'true' | 'false';
  BusinessUnit: string;
  AccountsReceivable: 'true' | 'false';
  PaymentCustom: {
    TransactionID: string;
    // numeric string
    PaymentSequence: string;
  };
  PaymentAllocation: PaymentAllocation;
};

type TenderIn = {
  // decimal string: 0.0000
  Amount: string;
  TenderCode: string;
  ReferenceCode?: string;
};

type Tender = TenderIn & {
  TransactionID: string;
  // numeric string
  TenderSequence: string;
  TenderName: string;
  Depositable: 'true' | 'false';
  Itemized: 'true' | 'false';
  BankID: string;
  TenderType: string;
  // decimal string: 0.0000
  NativeAmount: string;
  // decimal string: 1.000000
  ExchangeRate: string;
  UserDefined4: string;
  UserDefined5: string;
  TenderID: string;
  // ISO 8601 string: 2011-11-09T09:35:44.243-05:00
  ReferenceDate: string;
};

type TransactionIn = {
  // enforcing this at the type level
  Payment: PaymentIn;
  Tender: TenderIn;
  ForeignID?: string;
};

type Transaction = TransactionIn & {
  PaymentBatchID: string;
  TransactionID: string;
  // numeric string
  TransactionNum: string;
  TransactionStatus: string;
  MachineID: string;
  Company: string;
  Department: string;
  // ISO 8601 string: 2011-11-09T09:35:44.243-05:00
  EntryTimeStamp: string;
  // ISO 8601 string: 2011-11-09T09:35:44.243-05:00
  DateReceived: string;
  CollectionPoint: string;
  // decimal string: 0.0000
  TransactionTotal: string;
  // ISO 8601 string: 2011-11-09T09:35:44.243-05:00
  StartTime: string;
  Server: string;
  Payment: Payment;
  Tender: Tender;
};

type PaymentBatch = {
  PaymentBatchID: string;
  // numeric string
  PaymentBatchNum: string;
  OfficeCode: string;
  OwnerName: string;
  // ISO 8601 string: 2011-11-09T09:35:44.243-05:00
  OpenedTimeStamp: string;
  // ISO 8601 string: 2011-11-09T09:35:44.243-05:00
  BatchDate: string;
  PaymentOrigin: string;
  BatchStatus: string;
  // decimal string: 0.0000
  BatchDepositTotal: string;
  // decimal string: 0.0000
  BatchTransactionTotal: string;
  // decimal string: 0.0000
  BatchOverShortTotal: string;
  // decimal string: 0.0000
  BatchFloat: string;
  BatchActionReason: string;
  Transaction: Transaction;
};

export type AddTransactionInput = {
  strSecurityKey: string;
  strPaymentOrigin: string;
  xmlTransaction: {
    Transaction: TransactionIn & {
      attributes: {
        xmlns: '';
      };
    };
  };
};

export interface AddTransactionResult extends SuccessResult {
  VoidTransactionData: null;
  VoidingTransactionData: null;
  UnvoidedCreditCards: 'true' | 'false';
  PaymentBatch: PaymentBatch;
}

export type AddTransactionOutput = {
  AddTransactionResult: StandardResult<AddTransactionResult>;
};

export type RegisterSecurityKeyInput = {
  strSignOnUserName: string;
  strPassword: string;
};

export interface RegisterSecurityKeyResult extends SuccessResult {
  SecurityKey: string;
}

export type RegisterSecurityKeyOutput = {
  RegisterSecurityKeyResult: StandardResult<RegisterSecurityKeyResult>;
};

export type VoidTransactionInput = {
  strSecurityKey: string;
  strTransactionID: string;
  strAdjustmentReason: string;
};

export interface VoidTransactionResult extends SuccessResult {
  TransactionData: null;
  VoidTransactionData: null;
  VoidingTransactionData: null;
  UnvoidedCreditCards: 'true' | 'false';
}

export type VoidTransactionOutput = {
  VoidTransactionResult: StandardResult<VoidTransactionResult>;
};

export type AddTransactionReturn = {
  transactionId: string;
  transactionNum: string;
  batchId: string;
  batchNum: string;
};

export interface INovahClient {
  describe(): Object;
  AddTransactionAsync(
    input: AddTransactionInput
  ): Promise<AddTransactionOutput>;
  RegisterSecurityKeyAsync(
    input: RegisterSecurityKeyInput
  ): Promise<RegisterSecurityKeyOutput>;
  VoidTransactionAsync(
    input: VoidTransactionInput
  ): Promise<VoidTransactionOutput>;
}

/**
 * iNovah allocation codes for our different order types.
 *
 * Keys of this hash match the OrderType enum in registry-certs’ RegistryDb.ts
 * file.
 */
const ORDER_TYPE_TO_ALLOCATION_CODE = {
  DC: 'REG13',
  BC: 'REG14',
  MC: 'REG15',
};

export class INovahFactory {
  client: INovahClient;
  username: string;
  password: string;
  rollbar: Rollbar;

  constructor(
    client: INovahClient,
    rollbar: Rollbar,
    username: string,
    password: string
  ) {
    this.client = client;
    this.rollbar = rollbar;
    this.username = username;
    this.password = password;
  }

  async login(): Promise<string> {
    const { username, password } = this;
    const output = await this.client.RegisterSecurityKeyAsync({
      strSignOnUserName: username,
      strPassword: password,
    });

    const result = output.RegisterSecurityKeyResult.StandardResult.Result;

    switch (result.ReturnCode) {
      case 'Failure':
        throw Boom.unauthorized(result.LongErrorMessage);

      case 'Success':
        return result.SecurityKey;

      default:
        throw new Error(`Unknown ReturnCode: ${(result as any).ReturnCode}`);
    }
  }

  async inovah(paymentOrigin?: string) {
    if (!paymentOrigin) {
      throw new Error('Must specify payment origin');
    }

    const { client } = this;

    // We need to get a security key before every request because they're only
    // valid for 60s.
    const securityKey = await this.login();

    return new INovah(client, paymentOrigin, securityKey);
  }
}

// Loads the WDSL file for the endpoint and logs in. Returns a factory that can
// make INovah instances.
export async function makeINovahFactory(
  endpoint: string | undefined,
  username: string | undefined,
  password: string | undefined,
  rollbar: Rollbar
): Promise<INovahFactory> {
  if (!endpoint) {
    throw new Error('Must specify INOVAH_ENDPOINT');
  }

  if (!username) {
    throw new Error('Must specify INOVAH_USERNAME');
  }

  if (!password) {
    throw new Error('Must specify INOVAH_PASSWORD');
  }

  const client = await createSoapClient<INovahClient>(endpoint);
  const factory = new INovahFactory(client, rollbar, username, password);

  // initial test to make sure we can login
  await factory.login();

  return factory;
}

export default class INovah {
  client: INovahClient;

  paymentOrigin: string;
  securityKey: string;

  constructor(
    client: INovahClient,
    paymentOrigin: string,
    securityKey: string
  ) {
    this.client = client;

    this.paymentOrigin = paymentOrigin;
    this.securityKey = securityKey;
  }

  async describe(): Promise<Object> {
    return this.client.describe();
  }

  // Returns the iNovah TransactionID
  async addTransaction(
    registryOrderId: string,
    stripeChargeId: string,
    stripeTransactionId: string,
    orderType: string,
    { quantity, amountInDollars, unitPriceInDollars }: TransactionPayment,
    {
      cardholderName,
      billingAddress1,
      billingAddress2,
      billingCity,
      billingState,
      billingZip,
    }: TransactionCustomer
  ): Promise<AddTransactionReturn> {
    const { client, securityKey, paymentOrigin } = this;
    const allocationCode =
      ORDER_TYPE_TO_ALLOCATION_CODE[orderType] ||
      ORDER_TYPE_TO_ALLOCATION_CODE['DC'];

    const output = await client.AddTransactionAsync({
      strSecurityKey: securityKey,
      strPaymentOrigin: paymentOrigin,
      xmlTransaction: {
        Transaction: {
          attributes: {
            xmlns: '',
          },
          // Ensures we get idempotent updates
          ForeignID:
            process.env.SKIP_IDEMPOTENCY_CHECKS === '0'
              ? undefined
              : stripeTransactionId,
          Payment: {
            PaymentCode: allocationCode,
            PaymentAllocation: {
              AllocationCode: allocationCode,
              Quantity: quantity.toString(),
              Amount: amountInDollars.toFixed(4),
              UnitCharge: unitPriceInDollars.toString(),
            },
            Invoice: registryOrderId,
            LastName: cardholderName,
            StreetName: billingAddress1,
            City: billingCity,
            State: billingState,
            Zip: billingZip,
            PaymentCustom: {
              AddressLine1: billingAddress1,
              AddressLine2: billingAddress2,
              UnstructuredName: cardholderName,
            },
          },
          Tender: {
            TenderCode: 'STR',
            Amount: amountInDollars.toFixed(4),
            ReferenceCode: stripeChargeId,
          },
        },
      },
    });

    const result = output.AddTransactionResult.StandardResult.Result;

    switch (result.ReturnCode) {
      case 'Failure':
        // TODO(finh): In the case of ForeignKey being duplicated, look up by it
        // and return that information.
        throw Boom.badData(result.LongErrorMessage, result);

      case 'Success':
        return {
          batchId: result.PaymentBatch.PaymentBatchID,
          batchNum: result.PaymentBatch.PaymentBatchNum,
          transactionId: result.PaymentBatch.Transaction.TransactionID,
          transactionNum: result.PaymentBatch.Transaction.TransactionNum,
        };

      default:
        throw new Error(`Unknown ReturnCode: ${(result as any).ReturnCode}`);
    }
  }

  async voidTransaction(transactionId: string): Promise<boolean> {
    const { client, securityKey } = this;

    const output = await client.VoidTransactionAsync({
      strSecurityKey: securityKey,
      strTransactionID: transactionId,
      strAdjustmentReason: 'refund',
    });

    const result = output.VoidTransactionResult.StandardResult.Result;

    switch (result.ReturnCode) {
      case 'Failure':
        throw Boom.badData(result.LongErrorMessage, result);

      case 'Success':
        return true;

      default:
        throw new Error(`Unknown ReturnCode: ${(result as any).ReturnCode}`);
    }
  }
}
