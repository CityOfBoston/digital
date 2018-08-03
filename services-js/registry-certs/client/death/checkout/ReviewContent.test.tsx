import React from 'react';
import { shallow } from 'enzyme';

import Order from '../../models/Order';
import Cart from '../../store/Cart';

import ReviewContent from './ReviewContent';

describe('submitting', () => {
  let order;
  let cart;
  let submit: any;
  let wrapper;

  beforeEach(() => {
    cart = new Cart();
    order = new Order();
    submit = jest.fn();

    wrapper = shallow(
      <ReviewContent order={order} cart={cart} submit={submit} />
    );
  });

  it('reuses the idempotency key for overlapping requests', async () => {
    const form = wrapper.find('form');

    submit.mockReturnValue(Promise.resolve(true));
    form.simulate('submit', { preventDefault: jest.fn() });
    await Promise.resolve();

    const idempotencyKey = order.idempotencyKey;

    submit.mockReturnValue(Promise.resolve(true));
    form.simulate('submit', { preventDefault: jest.fn() });
    await Promise.resolve();

    expect(order.idempotencyKey).toEqual(idempotencyKey);
  });

  it('generates a new idempotency key if the first request failed', async () => {
    const form = wrapper.find('form');

    submit.mockReturnValue(Promise.resolve(false));
    form.simulate('submit', { preventDefault: jest.fn() });
    await Promise.resolve();

    const idempotencyKey = order.idempotencyKey;

    submit.mockReturnValue(Promise.resolve(false));
    form.simulate('submit', { preventDefault: jest.fn() });
    await Promise.resolve();

    expect(order.idempotencyKey).not.toEqual(idempotencyKey);
  });
});
