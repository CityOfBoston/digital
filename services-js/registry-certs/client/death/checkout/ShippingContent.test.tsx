import React from 'react';
import { shallow } from 'enzyme';

import Cart from '../../store/Cart';
import Order from '../../models/Order';

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
    const contactNameField = wrapper.find('#contact-name');
    contactNameField.simulate('change', { target: { value: 'Doreen Green' } });
    expect(order.info.contactName).toEqual('Doreen Green');
  });

  it('shows an error after blur', () => {
    expect(wrapper.text()).not.toMatch(/The full name field is required/);
    const contactNameField = wrapper.find('#contact-name');
    contactNameField.simulate('blur');
    const contactNameError = wrapper.find('#contactName-error');
    expect(contactNameError.text()).toMatch(/The full name field is required./);
  });

  it('submits', () => {
    const form = wrapper.find('form');
    form.simulate('submit', { preventDefault: jest.fn() });
    expect(submit).toHaveBeenCalled();
  });
});
