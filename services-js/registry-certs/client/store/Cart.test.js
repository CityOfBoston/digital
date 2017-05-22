// @flow

import Cart from './Cart';

const CERT_1: any = {
  id: '00001',

};

const CERT_2: any = {
  id: '00002',
};

describe('add and size', () => {
  let cart;

  beforeEach(() => {
    cart = new Cart();
  });

  it('adds an item to the cart', () => {
    cart.add(CERT_1, 1);
    expect(cart.size).toEqual(1);
  });

  it('adds several of an item to the cart', () => {
    cart.add(CERT_1, 3);
    expect(cart.size).toEqual(3);
  });

  it('adds 2 items to the cart', () => {
    cart.add(CERT_1, 1);
    cart.add(CERT_2, 1);
    expect(cart.size).toEqual(2);
  });

  it('adds the same item several times to the cart', () => {
    cart.add(CERT_1, 1);
    cart.add(Object.assign({}, CERT_1), 3);
    expect(cart.size).toEqual(4);
  });
});
