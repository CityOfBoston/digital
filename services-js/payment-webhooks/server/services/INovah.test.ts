import INovah, { INovahClient, INovahFactory } from './INovah';

const FAKE_USERNAME = 'brain.drain';
const FAKE_PASSWORD = 'palspalspals';
const FAKE_PAYMENT_ORIGIN = 'testhook';
const FAKE_SECURITY_KEY = '853bc748-e355-48b5-8e16-990ce2d62c80';
const FAKE_TRANSACTION_ID = '6f1ed5ba-c027-4112-8033-a73a2b090cb0';

const TEST_CUSTOMER = {
  cardholderName: 'Nancy Whitehead',
  billingAddress1: '15 College Ave.',
  billingAddress2: '',
  billingCity: 'New York',
  billingState: 'NY',
  billingZip: '02222',
};

const SECURITY_KEY_SUCCESS_RESULT = {
  ReturnCode: 'Success',
  ErrorType: 'None',
  ShortErrorMessage: null,
  LongErrorMessage: null,
  StatusInfo: 'OK',
  SecurityKey: FAKE_SECURITY_KEY,
};

const SECURITY_KEY_FAILURE_RESULT = {
  ReturnCode: 'Failure',
  ErrorType: 'Auth',
  ShortErrorMessage: 'Wrong password',
  LongErrorMessage: 'The password was wrong',
  StatusInfo: null,
};

const ADD_TRANSACTION_SUCCESS_RESULT = {
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
};

const VOID_TRANSACTION_SUCCESS_RESULT = {
  ReturnCode: 'Success',
  ErrorType: 'None',
  ShortErrorMessage: null,
  LongErrorMessage: null,
  StatusInfo: null,
  TransactionData: null,
  VoidTransactionData: null,
  VoidingTransactionData: null,
  UnvoidedCreditCards: 'false',
};

describe('INovahFactory', () => {
  let client: Record<keyof INovahClient, jest.Mock>;
  let inovahFactory: INovahFactory;
  let rollbar: any = {};

  beforeEach(() => {
    client = {
      describe: jest.fn(),
      AddTransactionAsync: jest.fn(),
      RegisterSecurityKeyAsync: jest.fn(),
      VoidTransactionAsync: jest.fn(),
    };

    inovahFactory = new INovahFactory(
      client,
      rollbar,
      FAKE_USERNAME,
      FAKE_PASSWORD
    );
  });

  describe('login', () => {
    it('returns a successful code', async () => {
      client.RegisterSecurityKeyAsync.mockReturnValue(
        Promise.resolve({
          RegisterSecurityKeyResult: {
            StandardResult: {
              Result: SECURITY_KEY_SUCCESS_RESULT,
            },
          },
        })
      );

      await expect(inovahFactory.login()).resolves.toEqual(FAKE_SECURITY_KEY);
    });

    it('handles wrong password error', async () => {
      client.RegisterSecurityKeyAsync.mockReturnValue(
        Promise.resolve({
          RegisterSecurityKeyResult: {
            StandardResult: {
              Result: SECURITY_KEY_FAILURE_RESULT,
            },
          },
        })
      );

      await expect(inovahFactory.login()).rejects.toMatchSnapshot();
    });
  });
});

describe('INovah', () => {
  let client: Record<keyof INovahClient, jest.Mock>;
  let inovah: INovah;

  beforeEach(() => {
    client = {
      describe: jest.fn(),
      AddTransactionAsync: jest.fn(),
      RegisterSecurityKeyAsync: jest.fn(),
      VoidTransactionAsync: jest.fn(),
    };

    inovah = new INovah(client, FAKE_SECURITY_KEY, FAKE_PAYMENT_ORIGIN);
  });

  describe('addTransaction', () => {
    beforeEach(() => {
      client.AddTransactionAsync.mockReturnValue(
        Promise.resolve({
          AddTransactionResult: {
            StandardResult: {
              Result: ADD_TRANSACTION_SUCCESS_RESULT,
            },
          },
        })
      );
    });

    it('returns the transaction id', async () => {
      await expect(
        inovah.addTransaction(
          'REG-DC-20171214-abcd123',
          'chg_testcharge',
          'txn_testtxn',
          'DC',
          {
            amountInDollars: 28.0,
            unitPriceInDollars: 14.0,
            quantity: 2,
          },
          TEST_CUSTOMER
        )
      ).resolves.toEqual({
        batchId: '61f393a8-eefc-4169-a374-cd59b0637943',
        batchNum: '2831',
        transactionId: FAKE_TRANSACTION_ID,
        transactionNum: '3',
      });
    });
  });

  describe('voidTransaction', () => {
    it('succeeds', async () => {
      client.VoidTransactionAsync.mockReturnValue(
        Promise.resolve({
          VoidTransactionResult: {
            StandardResult: {
              Result: VOID_TRANSACTION_SUCCESS_RESULT,
            },
          },
        })
      );

      await expect(
        inovah.voidTransaction(FAKE_TRANSACTION_ID)
      ).resolves.toEqual(true);
    });
  });
});
