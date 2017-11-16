// @flow
import { action, runInAction } from 'mobx';

import type { LoopbackGraphql } from '../lib/loopback-graphql';
import type Cart from '../store/Cart';
import type Order from '../models/Order';

import submitDeathCertificateOrder from '../queries/submit-death-certificate-order';

export default class CheckoutDao {
  loopbackGraphql: LoopbackGraphql;
  stripe: ?StripeInstance;

  constructor(loopbackGraphql: LoopbackGraphql, stripe: ?StripeInstance) {
    this.loopbackGraphql = loopbackGraphql;
    this.stripe = stripe;
  }

  @action
  async submit(
    cart: Cart,
    order: Order,
    cardElement: ?StripeElement
  ): Promise<?string> {
    const { stripe } = this;

    if (!stripe || !cardElement) {
      throw new Error('submit called without Stripe and/or StripeElement');
    }

    try {
      order.submitting = true;
      order.submissionError = null;

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
        runInAction('CheckoutDao > submit > createToken error result', () => {
          order.submissionError = tokenResult.error.message;
        });

        return null;
      }

      const orderId = await submitDeathCertificateOrder(
        this.loopbackGraphql,
        cart,
        order,
        tokenResult.token.id,
        tokenResult.token.card.last4
      );

      cart.clear();

      return orderId;
    } catch (err) {
      runInAction('CheckoutDao > submit > catch block', () => {
        order.submissionError =
          err.message || `Unexpected error submitting order: ${err}`;
      });

      if (window._opbeat && !err._sentToOpbeat) {
        window._opbeat('captureException', err);
      }

      return null;
    } finally {
      runInAction('CheckoutDao > submit > finally', () => {
        order.submitting = false;
      });
    }
  }
}
