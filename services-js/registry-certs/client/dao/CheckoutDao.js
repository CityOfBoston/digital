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

  // Given a StripeElement object, tokenizes the card info with Stripe and, if
  // successful, populates the cardToken and cardLast4 values in Order’s info
  // and returns true. Returns false and populates processingError if it fails
  // for network or validation reasons.
  @action
  async tokenizeCard(
    order: Order,
    cardElement: ?StripeElement
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
        runInAction(
          'CheckoutDao > tokenizeCard > createToken error result',
          () => {
            order.processingError = tokenResult.error.message;
          }
        );

        return false;
      } else {
        const { token } = tokenResult;
        const { card } = token;

        runInAction('CheckoutDao > tokenizeCard > createToken success', () => {
          order.cardToken = token.id;
          order.cardFunding = card.funding;
          order.info.cardLast4 = card.last4;
        });

        return true;
      }
    } catch (err) {
      runInAction('CheckoutDao > tokenizeCard > catch block', () => {
        order.processingError =
          err.message || `Unexpected error submitting order: ${err}`;
      });

      if (window._opbeat && !err._sentToOpbeat) {
        window._opbeat('captureException', err);
      }

      return false;
    } finally {
      runInAction('CheckoutDao > tokenizeCard > finally', () => {
        order.processing = false;
      });
    }
  }

  @action
  async submit(cart: Cart, order: Order): Promise<?string> {
    try {
      order.processing = true;
      order.processingError = null;

      const orderId = await submitDeathCertificateOrder(
        this.loopbackGraphql,
        cart,
        order
      );

      cart.clear();

      return orderId;
    } catch (err) {
      runInAction('CheckoutDao > submit > catch block', () => {
        order.processingError =
          err.message || `Unexpected error submitting order: ${err}`;
      });

      if (window._opbeat && !err._sentToOpbeat) {
        window._opbeat('captureException', err);
      }

      return null;
    } finally {
      runInAction('CheckoutDao > submit > finally', () => {
        order.processing = false;
      });
    }
  }
}
