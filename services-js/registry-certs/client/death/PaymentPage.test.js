// @flow
import React from 'react';
import { shallow } from 'enzyme';

import Cart from '../store/Cart';
import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
} from '../../fixtures/client/death-certificates';

import PaymentPage from './PaymentPage';

describe('submit', () => {
  let cart;
  let wrapper;

  beforeEach(() => {
    cart = new Cart();
    cart.add(TYPICAL_CERTIFICATE, 5);
    cart.add(PENDING_CERTIFICATE, 2);

    wrapper = shallow(<PaymentPage cart={cart} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('submits', () => {
    const form = wrapper.find('form');
    const preventDefault = jest.fn();

    form.simulate('submit', { preventDefault });
    expect(preventDefault).toHaveBeenCalled();
  });
});
