// @flow

import type { LoopbackGraphql } from '../lib/loopback-graphql';
import Cart from '../store/Cart';
import Order from '../models/Order';

import CheckoutDao from './CheckoutDao';

jest.mock('../queries/submit-death-certificate-order');
const submitDeathCertificateOrder: JestMockFn<
  *,
  Promise<string>
> = (require('../queries/submit-death-certificate-order'): any).default;

let loopbackGraphql: LoopbackGraphql;
let stripe: StripeInstance;
let dao: CheckoutDao;

let cart: Cart;
let order: Order;
let cardElement: StripeElement;

beforeEach(() => {
  loopbackGraphql = jest.fn();
  stripe = ({
    createToken: jest.fn(),
  }: any);

  submitDeathCertificateOrder.mockReturnValueOnce(Promise.resolve('order-id'));

  dao = new CheckoutDao(loopbackGraphql, stripe);

  cart = new Cart();
  order = new Order();
  cardElement = ({}: any);
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('submit', () => {
  test('tokenization success path', async () => {
    stripe.createToken.mockReturnValue(
      Promise.resolve({ token: { id: 'tok_id', card: { last4: '4040' } } })
    );

    const submitPromise = dao.submit(cart, order, cardElement);
    expect(order.submitting).toEqual(true);

    const orderId = await submitPromise;

    expect(submitDeathCertificateOrder).toHaveBeenCalledWith(
      loopbackGraphql,
      cart,
      order,
      'tok_id',
      '4040'
    );

    expect(orderId).toBeTruthy();
    expect(order.submitting).toEqual(false);
  });

  test('tokenization error response path', async () => {
    stripe.createToken.mockReturnValue(
      Promise.resolve({
        error: { message: 'The credit card could not be tokenized.' },
      })
    );

    const submitPromise = dao.submit(cart, order, cardElement);
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

    const submitPromise = dao.submit(cart, order, cardElement);
    expect(order.submitting).toEqual(true);

    const orderId = await submitPromise;

    expect(orderId).toEqual(null);
    expect(order.submissionError).toEqual(
      'Internet exploded. It’s for the best.'
    );
    expect(order.submitting).toEqual(false);
  });
});
