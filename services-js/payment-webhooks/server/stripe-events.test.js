// @flow

import { processStripeEvent } from './stripe-events';

import CHARGE from '../fixtures/stripe/charge';
import CHARGE_SUCCEEDED from '../fixtures/stripe/charge-succeeded';
import BALANCE_TRANSACTION from '../fixtures/stripe/balance-transaction';

describe('processStripeEvent', () => {
  let stripe: any;
  let inovah: any;

  beforeEach(() => {
    stripe = {
      balance: {},
      charges: {
        update: jest.fn(),
        retrieve: jest.fn(),
      },
    };

    inovah = {
      addTransaction: jest.fn(),
    };
  });

  describe('charge.succeeded', () => {
    beforeEach(() => {});
    test('it sends charge to iNovah', async () => {
      // we do the expanded balance transaction
      stripe.charges.retrieve.mockReturnValue(
        Promise.resolve(
          Object.assign({}, CHARGE, {
            balance_transaction: BALANCE_TRANSACTION,
          })
        )
      );

      inovah.addTransaction.mockReturnValue({});

      await processStripeEvent(
        { stripe, inovah, opbeat: ({}: any) },
        null,
        '',
        JSON.stringify(CHARGE_SUCCEEDED)
      );

      expect(inovah.addTransaction).toHaveBeenCalledWith(
        'DC-20171215-yg4lk',
        'ch_00000000000000',
        {
          amountInDollars: 14.0,
          quantity: 1,
          unitPriceInDollars: 14.0,
        },
        {
          billingAddress1: '1 City Hall Plaza',
          billingAddress2: '',
          billingCity: 'Boston',
          billingState: 'MA',
          billingZip: '02141',
          cardholderName: 'Tomas Lara-Perez',
        }
      );
    });

    test('it rejects if Stripe fails', async () => {
      // we do the expanded balance transaction
      stripe.charges.retrieve.mockReturnValue(
        Promise.reject(new Error('Stripe backend error!'))
      );

      expect(
        processStripeEvent(
          { stripe, inovah, opbeat: ({}: any) },
          null,
          '',
          JSON.stringify(CHARGE_SUCCEEDED)
        )
      ).rejects.toMatchSnapshot();
    });

    test('it rejects if iNovah fails', async () => {
      // we do the expanded balance transaction
      stripe.charges.retrieve.mockReturnValue(
        Promise.resolve(
          Object.assign({}, CHARGE, {
            balance_transaction: BALANCE_TRANSACTION,
          })
        )
      );

      inovah.addTransaction.mockReturnValue(
        Promise.reject(new Error('iNovah backend error!'))
      );

      expect(
        processStripeEvent(
          { stripe, inovah, opbeat: ({}: any) },
          null,
          '',
          JSON.stringify(CHARGE_SUCCEEDED)
        )
      ).rejects.toMatchSnapshot();
    });
  });
});
