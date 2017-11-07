// @flow
import { action, runInAction } from 'mobx';

import type { LoopbackGraphql } from '../lib/loopback-graphql';
import type Order from '../store/Order';

export default class CheckoutDao {
  loopbackGraphql: LoopbackGraphql;
  stripe: ?StripeInstance;

  constructor(loopbackGraphql: LoopbackGraphql, stripe: ?StripeInstance) {
    this.loopbackGraphql = loopbackGraphql;
    this.stripe = stripe;
  }

  @action
  async submit(order: Order, cardElement: ?StripeElement): Promise<?string> {
    try {
      order.submitting = true;
      order.submissionError = null;

      if (this.stripe && cardElement) {
        const result = await this.stripe.createToken(cardElement, {
          name: order.info.cardholderName,
          address_line1: order.billingAddress1,
          address_line2: order.billingAddress2,
          address_city: order.billingCity,
          address_state: order.billingState,
          address_zip: order.billingZip,
          address_country: 'us',
        });

        if (result.error) {
          runInAction('CheckoutDao > submit > createToken error result', () => {
            order.submissionError = result.error.message;
          });

          return null;
        }
      }

      return '1-234-56';
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
