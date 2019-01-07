import { FetchGraphql } from '@cityofboston/next-client-common';

import DeathCertificateCart from '../store/DeathCertificateCart';
import Order from '../models/Order';
import { OrderErrorCause } from '../queries/graphql-types';

import CheckoutDao from './CheckoutDao';

jest.mock('../queries/submit-death-certificate-order');
const submitDeathCertificateOrder: jest.Mock = (require('../queries/submit-death-certificate-order') as any)
  .default;

let fetchGraphql: FetchGraphql;
let stripe: stripe.Stripe;
let dao: CheckoutDao;

let cart: DeathCertificateCart;
let order: Order;

beforeEach(() => {
  fetchGraphql = jest.fn();
  stripe = {
    createToken: jest.fn(),
  } as any;

  dao = new CheckoutDao(fetchGraphql, stripe);

  cart = new DeathCertificateCart();
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

    await expect(tokenizePromise).resolves.toBeUndefined();

    expect(order.info.cardToken).toEqual('tok_id');
    expect(order.info.cardFunding).toEqual('debit');
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

    await expect(tokenizePromise).rejects.toMatchObject({
      message: 'The credit card could not be tokenized.',
    });

    expect(order.processing).toEqual(false);
  });

  test('tokenization network error path', async () => {
    (stripe.createToken as jest.Mock).mockReturnValue(
      Promise.reject(new Error('Internet exploded. It’s for the best.'))
    );

    const tokenizePromise = dao.tokenizeCard(order, cardElement);
    expect(order.processing).toEqual(true);

    await expect(tokenizePromise).rejects.toMatchObject({
      message: 'Internet exploded. It’s for the best.',
    });

    expect(order.processing).toEqual(false);
  });
});

describe('submit', () => {
  test('submit success path', async () => {
    submitDeathCertificateOrder.mockReturnValueOnce(
      Promise.resolve({
        order: {
          id: 'order-id',
        },
        error: null,
      })
    );

    const orderIdPromise = dao.submitDeathCertificateCart(cart, order);
    expect(order.processing).toEqual(true);

    const orderId = await orderIdPromise;
    expect(orderId).toEqual('order-id');
    expect(order.processing).toEqual(false);
  });

  test('submit network failure path', async () => {
    submitDeathCertificateOrder.mockReturnValueOnce(
      Promise.reject(new Error('I’m not dead yet!'))
    );

    const orderIdPromise = dao.submitDeathCertificateCart(cart, order);
    expect(order.processing).toEqual(true);

    await expect(orderIdPromise).rejects.toMatchObject({
      message: 'I’m not dead yet!',
    });
  });

  test('user payment failure path', async () => {
    submitDeathCertificateOrder.mockReturnValueOnce(
      Promise.resolve({
        order: null,
        error: {
          message: 'Your credit card is well expired',
          cause: OrderErrorCause.USER_PAYMENT,
        },
      })
    );

    const orderIdPromise = dao.submitDeathCertificateCart(cart, order);
    expect(order.processing).toEqual(true);

    await expect(orderIdPromise).rejects.toMatchObject({
      message: 'Your credit card is well expired',
      cause: OrderErrorCause.USER_PAYMENT,
    });
  });
});
