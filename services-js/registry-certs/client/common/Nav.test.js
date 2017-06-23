// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import Cart from '../store/Cart';
import Nav from './Nav';

describe('rendering', () => {
  let cart;

  beforeEach(() => {
    cart = new Cart();
  });

  it('renders checkout link', () => {
    expect(
      renderer.create(<Nav cart={cart} link="checkout" />).toJSON(),
    ).toMatchSnapshot();
  });

  it('renders lookup link', () => {
    expect(
      renderer.create(<Nav cart={cart} link="lookup" />).toJSON(),
    ).toMatchSnapshot();
  });
});
