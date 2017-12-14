// @flow

import { processStripeEvent } from './stripe-events';

import CHARGE_SUCCEEDED from '../fixtures/stripe/charge-succeeded';
import BALANCE_TRANSACTION from '../fixtures/stripe/balance-transaction';

describe('processStripeEvent', () => {
  let stripe: any;
  let inovah: any;

  beforeEach(() => {
    stripe = {
      balance: {
        retrieveTransaction: jest.fn(),
      },
    };

    inovah = {
      addTransaction: jest.fn(),
    };
  });

  describe('charge.succeeded', () => {
    beforeEach(() => {});
    test('it sends charge to iNovah', async () => {
      stripe.balance.retrieveTransaction.mockReturnValue(
        Promise.resolve(BALANCE_TRANSACTION)
      );

      await processStripeEvent(stripe, inovah, CHARGE_SUCCEEDED);
      expect(inovah.addTransaction).toHaveBeenCalledWith(14.0);
    });
    test('it rejects if Stripe fails', async () => {
      stripe.balance.retrieveTransaction.mockReturnValue(
        Promise.reject(new Error('Stripe backend error!'))
      );

      expect(
        processStripeEvent(stripe, inovah, CHARGE_SUCCEEDED)
      ).rejects.toMatchSnapshot();
    });

    test('it rejects if iNovah fails', async () => {
      stripe.balance.retrieveTransaction.mockReturnValue(
        Promise.resolve(BALANCE_TRANSACTION)
      );

      inovah.addTransaction.mockReturnValue(
        Promise.reject(new Error('iNovah backend error!'))
      );

      expect(
        processStripeEvent(stripe, inovah, CHARGE_SUCCEEDED)
      ).rejects.toMatchSnapshot();
    });
  });
});
