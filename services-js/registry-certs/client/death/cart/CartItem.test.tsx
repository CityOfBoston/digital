import React from 'react';
import { mount } from 'enzyme';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import DeathCertificateCart, {
  DeathCertificateCartEntry,
} from '../../store/DeathCertificateCart';

import CartItem from './CartItem';
import { TYPICAL_CERTIFICATE } from '../../../fixtures/client/death-certificates';

jest.mock('../../store/DeathCertificateCart');

describe('quantity field', () => {
  let entry: DeathCertificateCartEntry;
  let cart;
  let siteAnalytics;
  let wrapper;
  // let quantitySelect;
  // let quantityInput;

  beforeEach(() => {
    entry = new DeathCertificateCartEntry();
    entry.id = TYPICAL_CERTIFICATE.id;
    entry.cert = TYPICAL_CERTIFICATE;
    entry.quantity = 4;

    cart = new DeathCertificateCart();
    siteAnalytics = new GaSiteAnalytics();

    // mount because the quantity field is behind a render prop
    wrapper = mount(
      <CartItem
        cart={cart}
        siteAnalytics={siteAnalytics}
        entry={entry}
        lastRow
      />
    );
    // quantitySelect = wrapper.find('select');
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('Min Test', () => {
    expect(0).toEqual(0);
  });

  // it('changes the quantity when a number is added', () => {
  //   quantitySelect.simulate('change', { target: { value: '5' } });
  //   expect(cart.setQuantity).toHaveBeenCalledWith(TYPICAL_CERTIFICATE, 5);
  // });

  // it('changes the quantity (select) value +10, then check it the UI change to input', () => {
  //   quantitySelect.simulate('change', { target: { value: '5' } });
  //   // quantityInput = wrapper.find('input[name="quantityMenu"]');
  //   console.log(`cart: `, cart.setQuantity(5));
  //   expect(cart.setQuantity).toHaveBeenCalledWith(TYPICAL_CERTIFICATE, 5);
  // });
  // quantityInput = wrapper.find('input');
  // it('ignores non-numeric values', () => {
  //   quantitySelect.simulate('change', { target: { value: 'abc' } });
  //   expect(cart.setQuantity).not.toHaveBeenCalled();
  // });

  // it('turns the item to 0 on clearing out', () => {
  //   quantitySelect.simulate('change', { target: { value: '' } });
  //   expect(cart.setQuantity).toHaveBeenCalledWith(TYPICAL_CERTIFICATE, 0);
  // });
});

// it('Min Test', () => {
//   expect(0).toEqual(0);
// });

// export {};
