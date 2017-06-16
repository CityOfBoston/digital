// @flow

import soapStub from 'soap/soap-stub';
import sinon from 'sinon';

import INovah from './INovah';
import type {
  INovahClient,
  AddTransactionOutput,
  RegisterSecurtyKeyOutput,
  VoidTransactionOutput,
} from './INovah';

jest.mock('soap', () => {
  return {
    createClient: require('soap/soap-stub').createClient,
  };
});

const FAKE_ENDPOINT = 'http://fake-endpoint.test';
const FAKE_USERNAME = 'brain.drain';
const FAKE_PASSWORD = 'palspalspals';
const FAKE_PAYMENT_ORIGIN = 'testhook';
const FAKE_SECURITY_KEY = '853bc748-e355-48b5-8e16-990ce2d62c80';
const FAKE_TRANSACTION_ID = '6f1ed5ba-c027-4112-8033-a73a2b090cb0';

// soap-stub assumes Sinon mocks
const clientStub: INovahClient = {
  describe: sinon.stub(),
  AddTransaction: sinon.stub(),
  RegisterSecurityKey: sinon.stub(),
  VoidTransaction: sinon.stub(),
};

clientStub.AddTransaction.respondWithSuccess = soapStub.createRespondingStub(
  ({
    AddTransactionResult: {
      StandardResult: {
        Result: {
          ReturnCode: 'Success',
          ErrorType: 'None',
          ShortErrorMessage: null,
          LongErrorMessage: null,
          StatusInfo: null,
          VoidTransactionData: null,
          VoidingTransactionData: null,
          UnvoidedCreditCards: 'false',
          PaymentBatch: {
            PaymentBatchID: '61f393a8-eefc-4169-a374-cd59b0637943',
            PaymentBatchNum: '2831',
            OfficeCode: 'REG',
            OwnerName: '999999',
            OpenedTimeStamp: '2017-06-15T16:11:09.967-04:00',
            BatchDate: '2017-06-15T00:00:00-04:00',
            PaymentOrigin: 'TESTWEBHOO',
            BatchStatus: 'Opened',
            BatchDepositTotal: '0.0000',
            BatchTransactionTotal: '0.0000',
            BatchOverShortTotal: '0.0000',
            BatchFloat: '0.0000',
            BatchActionReason: 'Batch opened.',
            Transaction: {
              PaymentBatchID: '61f393a8-eefc-4169-a374-cd59b0637943',
              TransactionID: FAKE_TRANSACTION_ID,
              TransactionNum: '3',
              TransactionStatus: 'Valid',
              MachineID: '-Not Specified-',
              Company: 'City of Boston',
              Department: 'Registry',
              EntryTimeStamp: '2017-06-16T10:12:24.503-04:00',
              DateReceived: '2017-06-16T00:00:00-04:00',
              CollectionPoint: 'Internet',
              TransactionTotal: '15.0000',
              StartTime: '2017-06-16T10:12:24.19-04:00',
              Server: 'ZTINOVAH2',
              Payment: {
                TransactionID: FAKE_TRANSACTION_ID,
                PaymentSequence: '1',
                ReceiptNumber: '00087866',
                PaymentTotal: '15.0000',
                PaymentCode: 'REG13',
                PaymentName: 'Death Certificate Online',
                CurrentAmountDue: '0.0000',
                PastAmountDue: '0.0000',
                TotalAmountDue: '0.0000',
                BusinessFlag: 'false',
                InquiryPerformed: 'false',
                BusinessUnit: 'REG01',
                AccountsReceivable: 'false',
                PaymentCustom: {
                  TransactionID: FAKE_TRANSACTION_ID,
                  PaymentSequence: '1',
                },
                PaymentAllocation: {
                  TransactionID: FAKE_TRANSACTION_ID,
                  PaymentSequence: '1',
                  AllocationSequence: '1',
                  AllocationCode: 'REG13',
                  AllocationName: 'Death Certificate Online',
                  Quantity: '1.000000',
                  Amount: '15.0000',
                  GLAccount: '43105',
                  GLDepartment: '163',
                  GLCode: '100',
                  GLDescription: '0000',
                  AllocationID: 'fe63dada-d573-4a7c-ba58-79d6b0d89444',
                  UserDefined10: '0000',
                  UserDefined11: '2017',
                  UnitCharge: '15.000000',
                },
              },
              Tender: {
                TransactionID: FAKE_TRANSACTION_ID,
                TenderSequence: '1',
                TenderCode: 'CASH',
                TenderName: 'Cash',
                Depositable: 'true',
                Itemized: 'false',
                BankID: 'TREASURY',
                TenderType: 'General',
                NativeAmount: '0.0000',
                ExchangeRate: '1.000000',
                Amount: '15.0000',
                UserDefined4: 'CASH',
                UserDefined5: '2',
                TenderID: 'f220251f-f75b-4363-955f-d7fdc3b7a0dd',
                ReferenceDate: '2011-11-09T09:35:44.243-05:00',
              },
            },
          },
        },
      },
    },
  }: AddTransactionOutput),
);

clientStub.RegisterSecurityKey.respondWithSuccess = soapStub.createRespondingStub(
  ({
    RegisterSecurityKeyResult: {
      StandardResult: {
        Result: {
          ReturnCode: 'Success',
          ErrorType: 'None',
          ShortErrorMessage: null,
          LongErrorMessage: null,
          StatusInfo: 'OK',
          SecurityKey: FAKE_SECURITY_KEY,
        },
      },
    },
  }: RegisterSecurtyKeyOutput),
);

clientStub.RegisterSecurityKey.respondWithFailure = soapStub.createRespondingStub(
  ({
    RegisterSecurityKeyResult: {
      StandardResult: {
        Result: {
          ReturnCode: 'Failure',
          ErrorType: 'Auth',
          ShortErrorMessage: 'Wrong password',
          LongErrorMessage: 'The password was wrong',
          StatusInfo: null,
        },
      },
    },
  }: RegisterSecurtyKeyOutput),
);

clientStub.VoidTransaction.respondWithSuccess = soapStub.createRespondingStub(
  ({
    VoidTransactionResult: {
      StandardResult: {
        Result: {
          ReturnCode: 'Success',
          ErrorType: 'None',
          ShortErrorMessage: null,
          LongErrorMessage: null,
          StatusInfo: null,
          TransactionData: null,
          VoidTransactionData: null,
          VoidingTransactionData: null,
          UnvoidedCreditCards: 'false',
        },
      },
    },
  }: VoidTransactionOutput),
);

soapStub.registerClient('inovah', FAKE_ENDPOINT + '?WSDL', clientStub);

let opbeat: any = null;
let iNovah;

beforeEach(() => {
  iNovah = new INovah(
    FAKE_ENDPOINT,
    FAKE_USERNAME,
    FAKE_PASSWORD,
    FAKE_PAYMENT_ORIGIN,
    opbeat,
  );
});

describe('registerSecurityKey', () => {
  it('returns a successful code', async () => {
    const keyPromise = iNovah.registerSecurityKey();
    clientStub.RegisterSecurityKey.respondWithSuccess();

    await expect(keyPromise).resolves.toEqual(FAKE_SECURITY_KEY);
  });

  it('handles wrong error', async () => {
    const keyPromise = iNovah.registerSecurityKey();
    clientStub.RegisterSecurityKey.respondWithFailure();

    await expect(keyPromise).rejects.toMatchSnapshot();
  });
});

describe('addTransaction', () => {
  it('returns the transaction id', async () => {
    const transactionIdPromise = iNovah.addTransaction(15);

    // need to register security key so we can log in
    clientStub.RegisterSecurityKey.respondWithSuccess();
    clientStub.AddTransaction.respondWithSuccess();

    await expect(transactionIdPromise).resolves.toEqual(FAKE_TRANSACTION_ID);
  });
});

describe('voidTransaction', () => {
  it('succeeds', async () => {
    const responsePromise = iNovah.voidTransaction(FAKE_TRANSACTION_ID);

    // need to register security key so we can log in
    clientStub.RegisterSecurityKey.respondWithSuccess();
    clientStub.VoidTransaction.respondWithSuccess();

    await expect(responsePromise).resolves.toEqual(true);
  });
});
