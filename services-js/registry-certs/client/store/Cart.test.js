// @flow

import Cart from './Cart';

jest.mock('../dao/DeathCertificatesDao');
const DeathCertificatesDao = require('../dao/DeathCertificatesDao').default;

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

describe('cost', () => {
  let cart;

  beforeEach(() => {
    cart = new Cart();
  });

  it('charges based on one certificate', () => {
    cart.add(CERT_1, 1);
    expect(cart.cost).toEqual(14.39);
  });
});

describe('setQuantity', () => {
  let cart;

  beforeEach(() => {
    cart = new Cart();
    cart.add(CERT_1, 1);
  });

  it('it changes the quantity', () => {
    expect(cart.size).toEqual(1);
    cart.setQuantity(CERT_1.id, 5);
    expect(cart.size).toEqual(5);
  });

  it('is a no-op when the ID isn’t found', () => {
    expect(cart.size).toEqual(1);
    cart.setQuantity(CERT_2.id, 5);
    expect(cart.size).toEqual(1);
  });
});

describe('remove', () => {
  let cart;

  beforeEach(() => {
    cart = new Cart();
    cart.add(CERT_1, 1);
  });

  it('removes an item from the cart', () => {
    expect(cart.size).toEqual(1);
    cart.remove(CERT_1.id);
    expect(cart.size).toEqual(0);
    expect(cart.items.length).toEqual(0);
  });

  it('is a no-op when the id isn’t found', () => {
    expect(cart.size).toEqual(1);
    cart.remove(CERT_2.id);
    expect(cart.size).toEqual(1);
    expect(cart.items.length).toEqual(1);
  });
});

describe('attach', () => {
  let resolveGraphqls;
  let localStorage: any;
  let deathCertificatesDao;
  let cart: Cart;

  beforeEach(() => {
    localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };

    deathCertificatesDao = new DeathCertificatesDao(jest.fn());

    resolveGraphqls = [];

    deathCertificatesDao.get.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveGraphqls.push(resolve);
        }),
    );

    cart = new Cart();
  });

  afterEach(() => {
    cart.detach();
  });

  it('hydrates items from local storage', async () => {
    localStorage.getItem.mockReturnValue(
      JSON.stringify([
        { id: '00001', quantity: 4 },
        { id: '00002', quantity: 1 },
      ]),
    );

    cart.attach(localStorage, deathCertificatesDao);

    expect(deathCertificatesDao.get).toHaveBeenCalledWith('00001');
    expect(deathCertificatesDao.get).toHaveBeenCalledWith('00002');

    expect(cart.loading).toEqual(true);

    const item1 = cart.items[0];
    const item2 = cart.items[1];

    expect(item1.id).toEqual('00001');
    expect(item1.cert).toEqual(null);
    expect(item1.quantity).toEqual(4);
    expect(item2.id).toEqual('00002');
    expect(item2.cert).toEqual(null);
    expect(item2.quantity).toEqual(1);

    await resolveGraphqls[0](CERT_1);
    expect(cart.loading).toEqual(true);

    await resolveGraphqls[1](CERT_2);
    expect(cart.loading).toEqual(false);

    expect(item1.cert).toEqual(CERT_1);
    expect(item2.cert).toEqual(CERT_2);
  });

  it('updates local storage with new values', async () => {
    cart.attach(localStorage, deathCertificatesDao);

    cart.add(CERT_1, 5);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([{ id: CERT_1.id, quantity: 5 }]),
    );
  });
});
