// @flow
import React from 'react';
import { runInAction } from 'mobx';
import renderer from 'react-test-renderer';

import Cart from '../store/Cart';
import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
} from '../../fixtures/client/death-certificates';

import CheckoutPage from './CheckoutPage';

describe('rendering', () => {
  let cart;

  beforeEach(() => {
    cart = new Cart();
  });

  it('renders loading for unhydrated cart', () => {
    runInAction(() => {
      cart.pendingFetches = 2;
      cart.items = ([
        {
          id: TYPICAL_CERTIFICATE.id,
          cert: null,
          quantity: 5,
        },
        {
          id: PENDING_CERTIFICATE.id,
          cert: null,
          quantity: 3,
        },
      ]: any);
    });

    expect(
      renderer.create(<CheckoutPage cart={cart} />).toJSON(),
    ).toMatchSnapshot();
  });

  it('renders a hydrated cart', () => {
    cart.add(TYPICAL_CERTIFICATE, 5);
    cart.add(PENDING_CERTIFICATE, 2);

    expect(
      renderer.create(<CheckoutPage cart={cart} />).toJSON(),
    ).toMatchSnapshot();
  });
});
