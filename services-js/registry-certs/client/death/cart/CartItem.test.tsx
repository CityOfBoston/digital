import React from 'react';
import { mount } from 'enzyme';

import Cart, { CartEntry } from '../../store/Cart';
import SiteAnalytics from '../../lib/SiteAnalytics';

import CartItem from './CartItem';
import { TYPICAL_CERTIFICATE } from '../../../fixtures/client/death-certificates';

jest.mock('../../store/Cart');

describe('quantity field', () => {
  let entry: CartEntry;
  let cart;
  let siteAnalytics;
  let wrapper;
  let quantityField;

  beforeEach(() => {
    entry = new CartEntry();
    entry.id = TYPICAL_CERTIFICATE.id;
    entry.cert = TYPICAL_CERTIFICATE;
    entry.quantity = 4;

    cart = new Cart();
    siteAnalytics = new SiteAnalytics();

    // mount because the quantity field is behind a render prop
    wrapper = mount(
      <CartItem
        cart={cart}
        siteAnalytics={siteAnalytics}
        entry={entry}
        lastRow
      />
    );
    quantityField = wrapper.find('input');
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('changes the quantity when a number is added', () => {
    quantityField.simulate('change', { target: { value: '5' } });
    expect(cart.setQuantity).toHaveBeenCalledWith(TYPICAL_CERTIFICATE, 5);
  });

  it('ignores non-numeric values', () => {
    quantityField.simulate('change', { target: { value: 'abc' } });
    expect(cart.setQuantity).not.toHaveBeenCalled();
  });

  it('turns the item to 0 on clearing out', () => {
    quantityField.simulate('change', { target: { value: '' } });
    expect(cart.setQuantity).toHaveBeenCalledWith(TYPICAL_CERTIFICATE, 0);
  });
});
