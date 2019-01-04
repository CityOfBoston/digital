import { action, runInAction } from 'mobx';

import { FetchGraphql } from '@cityofboston/next-client-common';

import DeathCertificateCart from '../store/DeathCertificateCart';
import Order from '../models/Order';

import submitDeathCertificateOrder from '../queries/submit-death-certificate-order';
import {
  OrderErrorCause,
  SubmitDeathCertificateOrder_submitDeathCertificateOrder,
} from '../queries/graphql-types';

export class SubmissionError extends Error {
  public readonly cause: OrderErrorCause;

  constructor(message: string, cause: OrderErrorCause) {
    super(message);
    this.cause = cause;
  }
}

export default class CheckoutDao {
  fetchGraphql: FetchGraphql;
  stripe: stripe.Stripe | null;

  constructor(fetchGraphql: FetchGraphql, stripe: stripe.Stripe | null) {
    this.fetchGraphql = fetchGraphql;
    this.stripe = stripe;
  }

  /**
   * Given a StripeElement object, tokenizes the card info with Stripe and, if
   * successful, populates the cardToken and cardLast4 values in Order’s info.
   *
   * We rely on Stripe’s form validation to catch straightforward errors (such
   * as a card number that doesn’t match the formula) so we’re fairly sure that
   * tokenization will succeed so we don’t need to handle the errors very
   * delicately.
   *
   * Sets Order#processing to true while the API call is outstanding
   *
   * @throws An Error if things did not work. Reports to Rollbar so that callers
   * don’t have to.
   */
  @action
  async tokenizeCard(
    order: Order,
    cardElement: stripe.elements.Element | null
  ): Promise<void> {
    const { stripe } = this;

    if (!stripe || !cardElement) {
      throw new Error(
        'tokenizeCard called without Stripe and/or StripeElement'
      );
    }

    try {
      order.processing = true;

      const tokenResult = await stripe.createToken(cardElement, {
        name: order.info.cardholderName,
        address_line1: order.billingAddress1,
        address_line2: order.billingAddress2,
        address_city: order.billingCity,
        address_state: order.billingState,
        address_zip: order.billingZip,
        address_country: 'us',
      });

      if (tokenResult.error) {
        throw new Error(tokenResult.error.message);
      } else {
        const { token } = tokenResult;

        if (!token) {
          throw new Error('Token was not in token result');
        }

        const { card } = token;

        if (!card) {
          throw new Error('Card was not in token result');
        }

        runInAction(() => {
          order.info.cardToken = token.id;
          order.info.cardFunding = card.funding;
          order.info.cardLast4 = card.last4;
        });
      }
    } catch (err) {
      if ((window as any).Rollbar && !err._reportedException) {
        (window as any).Rollbar.error(err);
        err._reportedException = true;
      }

      throw err;
    } finally {
      runInAction(() => {
        order.processing = false;
      });
    }
  }

  /**
   * Submits the given cart’s worth of certificates with the order data
   * (address, &c.).
   *
   * Sets Order#processing to true while the API call is outstanding
   *
   * @returns The order ID on success.
   * @throws Error or SubmissionError objects. Reports errors to Rollbar.
   */
  @action
  async submit(cart: DeathCertificateCart, order: Order): Promise<string> {
    try {
      order.processing = true;

      let orderResult: SubmitDeathCertificateOrder_submitDeathCertificateOrder;

      try {
        orderResult = await submitDeathCertificateOrder(
          this.fetchGraphql,
          cart,
          order
        );
      } catch (err) {
        // These errors will be network sorts of errors.
        if ((window as any).Rollbar && !err._reportedException) {
          (window as any).Rollbar.error(err);
          err._reportedException = true;
        }

        throw err;
      }

      if (orderResult.order) {
        return orderResult.order.id;
      } else if (orderResult.error) {
        // We don't need this to be reported to Rollbar. If it’s an internal
        // error, the server would have reported it, and if it’s a user error
        // (card information) we don’t care.
        throw new SubmissionError(
          orderResult.error.message,
          orderResult.error.cause
        );
      } else {
        // This won’t happen
        throw new Error('Result did not have an order or error');
      }
    } finally {
      runInAction(() => {
        order.processing = false;
      });
    }
  }
}
