import { action, runInAction } from 'mobx';

import { LoopbackGraphql } from '../lib/loopback-graphql';
import Cart from '../store/Cart';
import Order from '../models/Order';

import submitDeathCertificateOrder from '../queries/submit-death-certificate-order';

export default class CheckoutDao {
  loopbackGraphql: LoopbackGraphql;
  stripe: stripe.Stripe | null;

  constructor(loopbackGraphql: LoopbackGraphql, stripe: stripe.Stripe | null) {
    this.loopbackGraphql = loopbackGraphql;
    this.stripe = stripe;
  }

  // Given a StripeElement object, tokenizes the card info with Stripe and, if
  // successful, populates the cardToken and cardLast4 values in Order’s info
  // and returns true. Returns false and populates processingError if it fails
  // for network or validation reasons.
  @action
  async tokenizeCard(
    order: Order,
    cardElement: stripe.elements.Element | null
  ): Promise<boolean> {
    const { stripe } = this;

    if (!stripe || !cardElement) {
      throw new Error(
        'tokenizeCard called without Stripe and/or StripeElement'
      );
    }

    try {
      order.processing = true;
      order.processingError = null;

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
        runInAction(() => {
          order.processingError =
            (tokenResult.error && tokenResult.error.message) || null;
        });

        return false;
      } else {
        const { token } = tokenResult;

        if (!token) {
          return false;
        }

        const { card } = token;

        if (!card) {
          return false;
        }

        runInAction(() => {
          order.cardToken = token.id;
          order.cardFunding = card.funding;
          order.info.cardLast4 = card.last4;
        });

        return true;
      }
    } catch (err) {
      runInAction(() => {
        order.processingError =
          err.message || `Unexpected error submitting order: ${err}`;
      });

      if ((window as any).Rollbar && !err._reportedException) {
        (window as any).Rollbar.error(err);
        err._reportedException = true;
      }

      return false;
    } finally {
      runInAction(() => {
        order.processing = false;
      });
    }
  }

  // Does not reject. Instead stores errors in Order.processingError
  @action
  async submit(cart: Cart, order: Order): Promise<string | null> {
    try {
      order.processing = true;
      order.processingError = null;

      const orderId = await submitDeathCertificateOrder(
        this.loopbackGraphql,
        cart,
        order
      );

      return orderId;
    } catch (err) {
      runInAction(() => {
        order.processingError =
          err.message || `Unexpected error submitting order: ${err}`;
      });

      if ((window as any).Rollbar && !err._reportedException) {
        (window as any).Rollbar.error(err);
        err._reportedException = true;
      }

      return null;
    } finally {
      runInAction(() => {
        order.processing = false;
      });
    }
  }
}
