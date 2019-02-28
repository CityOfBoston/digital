import React from 'react';
import { shallow } from 'enzyme';

import Order from '../../models/Order';
import Cart from '../../store/DeathCertificateCart';
import { OrderErrorCause } from '../../queries/graphql-types';
import { SubmissionError } from '../../dao/CheckoutDao';

import ReviewContent from './ReviewContent';

describe('submitting', () => {
  let order;
  let cart;
  let submit: jest.Mock<Promise<void>>;
  let wrapper;

  beforeEach(() => {
    cart = new Cart();
    order = new Order();
    submit = jest.fn();

    wrapper = shallow(
      <ReviewContent
        order={order}
        certificateType="death"
        deathCertificateCart={cart}
        submit={submit}
      />
    );
  });

  it('reuses the idempotency key for overlapping requests', async () => {
    const form = wrapper.find('form');

    submit.mockReturnValue(Promise.resolve());
    form.simulate('submit', { preventDefault: jest.fn() });
    await Promise.resolve();

    const idempotencyKey = order.idempotencyKey;

    submit.mockReturnValue(Promise.resolve());
    form.simulate('submit', { preventDefault: jest.fn() });
    await Promise.resolve();

    expect(order.idempotencyKey).toEqual(idempotencyKey);
  });

  it('generates a new idempotency key if the first request failed', async () => {
    const form = wrapper.find('form');

    submit.mockReturnValue(
      Promise.reject(
        new SubmissionError('Card processing failed', OrderErrorCause.INTERNAL)
      )
    );
    form.simulate('submit', { preventDefault: jest.fn() });
    await Promise.resolve();

    const idempotencyKey = order.idempotencyKey;

    submit.mockReturnValue(
      Promise.reject(
        new SubmissionError(
          'Card processing failed again',
          OrderErrorCause.INTERNAL
        )
      )
    );
    form.simulate('submit', { preventDefault: jest.fn() });
    await Promise.resolve();

    expect(order.idempotencyKey).not.toEqual(idempotencyKey);
  });
});
