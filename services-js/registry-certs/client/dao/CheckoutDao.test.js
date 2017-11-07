// @flow

import type { LoopbackGraphql } from '../lib/loopback-graphql';
import Order from '../store/Order';

import CheckoutDao from './CheckoutDao';

let loopbackGraphql: LoopbackGraphql;
let stripe: StripeInstance;
let dao: CheckoutDao;

let order: Order;
let cardElement: StripeElement;

beforeEach(() => {
  loopbackGraphql = jest.fn();
  stripe = ({
    createToken: jest.fn(),
  }: any);

  dao = new CheckoutDao(loopbackGraphql, stripe);

  order = new Order();
  cardElement = ({}: any);
});

describe('submit', () => {
  test('tokenization success path', async () => {
    stripe.createToken.mockReturnValue(
      Promise.resolve({ token: { id: 'tok_id' } })
    );

    const submitPromise = dao.submit(order, cardElement);
    expect(order.submitting).toEqual(true);

    const orderId = await submitPromise;

    expect(orderId).toBeTruthy();
    expect(order.submitting).toEqual(false);
  });

  test('tokenization error response path', async () => {
    stripe.createToken.mockReturnValue(
      Promise.resolve({
        error: { message: 'The credit card could not be tokenized.' },
      })
    );

    const submitPromise = dao.submit(order, cardElement);
    expect(order.submitting).toEqual(true);

    const orderId = await submitPromise;

    expect(orderId).toEqual(null);
    expect(order.submissionError).toEqual(
      'The credit card could not be tokenized.'
    );
    expect(order.submitting).toEqual(false);
  });

  test('tokenization network error path', async () => {
    stripe.createToken.mockReturnValue(
      Promise.reject(new Error('Internet exploded. It’s for the best.'))
    );

    const submitPromise = dao.submit(order, cardElement);
    expect(order.submitting).toEqual(true);

    const orderId = await submitPromise;

    expect(orderId).toEqual(null);
    expect(order.submissionError).toEqual(
      'Internet exploded. It’s for the best.'
    );
    expect(order.submitting).toEqual(false);
  });
});
