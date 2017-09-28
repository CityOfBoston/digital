// @flow
import React from 'react';
import { shallow } from 'enzyme';

import Cart from '../../store/Cart';
import Order from '../../store/Order';

import ShippingContent from './ShippingContent';

describe('content', () => {
  let cart;
  let order;
  let submit;
  let wrapper;

  beforeEach(() => {
    cart = new Cart();
    order = new Order();
    submit = jest.fn();
    wrapper = shallow(
      <ShippingContent cart={cart} order={order} submit={submit} />
    );
  });

  it('updates a field', () => {
    const contactNameField = wrapper.find('input[name="name"]');
    contactNameField.simulate('change', { target: { value: 'Doreen Green' } });
    expect(order.info.contactName).toEqual('Doreen Green');
  });

  it('submits', () => {
    const form = wrapper.find('form');
    form.simulate('submit', { preventDefault: jest.fn() });
    expect(submit).toHaveBeenCalled();
  });
});
