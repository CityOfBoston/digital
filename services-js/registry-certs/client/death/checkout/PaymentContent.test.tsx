import React from 'react';
import { shallow } from 'enzyme';

import Cart from '../../store/Cart';
import Order from '../../models/Order';

import PaymentContent from './PaymentContent';

describe('content', () => {
  let cart: Cart;
  let order: Order;
  let submit;
  let wrapper;

  beforeEach(() => {
    cart = new Cart();
    order = new Order();
    order.info.billingAddressSameAsShippingAddress = false;
    submit = jest.fn();
    wrapper = shallow(
      <PaymentContent cart={cart} stripe={null} order={order} submit={submit} />
    );
  });

  it('updates a field', () => {
    const contactNameField = wrapper.find('input[name="billing-address-1"]');
    contactNameField.simulate('change', {
      target: { value: 'Avengers Tower' },
    });
    expect(order.info.billingAddress1).toEqual('Avengers Tower');
  });

  it('submits', () => {
    const form = wrapper.find('form');
    form.simulate('submit', { preventDefault: jest.fn() });
    expect(submit).toHaveBeenCalled();
  });
});
