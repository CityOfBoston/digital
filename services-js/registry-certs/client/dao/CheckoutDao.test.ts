// @flow

import { LoopbackGraphql } from '../lib/loopback-graphql';
import Cart from '../store/Cart';
import Order from '../models/Order';

import CheckoutDao from './CheckoutDao';

jest.mock('../queries/submit-death-certificate-order');
const submitDeathCertificateOrder: jest.Mock = (require('../queries/submit-death-certificate-order') as any)
  .default;

let loopbackGraphql: LoopbackGraphql;
let stripe: stripe.Stripe;
let dao: CheckoutDao;

let cart: Cart;
let order: Order;

beforeEach(() => {
  loopbackGraphql = jest.fn();
  stripe = {
    createToken: jest.fn(),
  } as any;

  dao = new CheckoutDao(loopbackGraphql, stripe);

  cart = new Cart();
  order = new Order();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('tokenizeCard', () => {
  const cardElement: stripe.elements.Element = {} as any;

  test('tokenization success path', async () => {
    (stripe.createToken as jest.Mock).mockReturnValue(
      Promise.resolve({
        token: { id: 'tok_id', card: { last4: '4040', funding: 'debit' } },
      })
    );

    const tokenizePromise = dao.tokenizeCard(order, cardElement);
    expect(order.processing).toEqual(true);

    const success = await tokenizePromise;

    expect(success).toEqual(true);
    expect(order.cardToken).toEqual('tok_id');
    expect(order.cardFunding).toEqual('debit');
    expect(order.info.cardLast4).toEqual('4040');
    expect(order.processing).toEqual(false);
  });

  test('tokenization error response path', async () => {
    (stripe.createToken as jest.Mock).mockReturnValue(
      Promise.resolve({
        error: { message: 'The credit card could not be tokenized.' },
      })
    );

    const tokenizePromise = dao.tokenizeCard(order, cardElement);
    expect(order.processing).toEqual(true);

    const success = await tokenizePromise;

    expect(success).toEqual(false);
    expect(order.processingError).toEqual(
      'The credit card could not be tokenized.'
    );
    expect(order.processing).toEqual(false);
  });

  test('tokenization network error path', async () => {
    (stripe.createToken as jest.Mock).mockReturnValue(
      Promise.reject(new Error('Internet exploded. It’s for the best.'))
    );

    const tokenizePromise = dao.tokenizeCard(order, cardElement);
    expect(order.processing).toEqual(true);

    const success = await tokenizePromise;

    expect(success).toEqual(false);
    expect(order.processingError).toEqual(
      'Internet exploded. It’s for the best.'
    );
    expect(order.processing).toEqual(false);
  });
});

describe('submit', () => {
  test('submit success path', async () => {
    submitDeathCertificateOrder.mockReturnValueOnce(
      Promise.resolve('order-id')
    );

    const orderIdPromise = dao.submit(cart, order);
    expect(order.processing).toEqual(true);

    const orderId = await orderIdPromise;
    expect(orderId).toEqual('order-id');
    expect(order.processing).toEqual(false);
  });

  test('submit failure path', async () => {
    submitDeathCertificateOrder.mockReturnValueOnce(
      Promise.reject(new Error('I’m not dead yet!'))
    );

    const orderIdPromise = dao.submit(cart, order);
    expect(order.processing).toEqual(true);

    const orderId = await orderIdPromise;
    expect(orderId).toEqual(null);
    expect(order.processing).toEqual(false);
    expect(order.processingError).toEqual('I’m not dead yet!');
  });
});
