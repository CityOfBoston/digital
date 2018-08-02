import Cart from './Cart';

jest.mock('../dao/DeathCertificatesDao');
jest.mock('../lib/SiteAnalytics');
const DeathCertificatesDao = require('../dao/DeathCertificatesDao').default;
const SiteAnalytics = require('../lib/SiteAnalytics').default;

const CERT_1: any = {
  id: '00001',
  pending: false,
};

const CERT_2: any = {
  id: '00002',
  pending: true,
};

describe('setQuantity', () => {
  let cart;

  beforeEach(() => {
    cart = new Cart();
    cart.setQuantity(CERT_1, 1);
  });

  it('it changes the quantity', () => {
    expect(cart.size).toEqual(1);
    cart.setQuantity(CERT_1, 5);
    expect(cart.size).toEqual(5);
  });

  it('keeps an entry with quantity 0', () => {
    expect(cart.size).toEqual(1);
    cart.setQuantity(CERT_1, 0);
    expect(cart.size).toEqual(0);
    expect(cart.entries.length).toEqual(1);
  });
});

describe('clean', () => {
  let cart;

  beforeEach(() => {
    cart = new Cart();
    cart.setQuantity(CERT_1, 0);
    cart.setQuantity(CERT_2, 5);
  });

  it('removes certs with 0', () => {
    expect(cart.size).toEqual(5);
    expect(cart.entries.length).toEqual(2);
    cart.clean();
    expect(cart.size).toEqual(5);
    expect(cart.entries.length).toEqual(1);
  });
});

describe('remove', () => {
  let cart;

  beforeEach(() => {
    cart = new Cart();
    cart.setQuantity(CERT_1, 1);
  });

  it('removes an item from the cart', () => {
    expect(cart.size).toEqual(1);
    cart.remove(CERT_1.id);
    expect(cart.size).toEqual(0);
    expect(cart.entries.length).toEqual(0);
  });

  it('is a no-op when the id isn’t found', () => {
    expect(cart.size).toEqual(1);
    cart.remove(CERT_2.id);
    expect(cart.size).toEqual(1);
    expect(cart.entries.length).toEqual(1);
  });
});

describe('contains pending', () => {
  let cart;

  beforeEach(() => {
    cart = new Cart();
    cart.setQuantity(CERT_1, 1);
  });

  it('is false if there are no pending certificates', () => {
    expect(cart.containsPending).toEqual(false);
  });

  it('is true if there are pending certificates', () => {
    cart.setQuantity(CERT_2, 5);
    expect(cart.containsPending).toEqual(true);
  });
});

describe('attach', () => {
  let resolveGraphqls;
  let localStorage: any;
  let deathCertificatesDao;
  let siteAnalytics;
  let cart: Cart;

  beforeEach(() => {
    localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };

    deathCertificatesDao = new DeathCertificatesDao(jest.fn());
    siteAnalytics = new SiteAnalytics();

    resolveGraphqls = [];

    deathCertificatesDao.get.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveGraphqls.push(resolve);
        })
    );

    cart = new Cart();
  });

  afterEach(() => {
    cart.detach();
  });

  it('hydrates entries from local storage', async () => {
    localStorage.getItem.mockReturnValue(
      JSON.stringify([
        { id: '00001', quantity: 4 },
        { id: '00002', quantity: 1 },
      ])
    );

    cart.attach(localStorage, deathCertificatesDao, siteAnalytics);

    expect(deathCertificatesDao.get).toHaveBeenCalledWith('00001');
    expect(deathCertificatesDao.get).toHaveBeenCalledWith('00002');

    expect(cart.loading).toEqual(true);

    const item1 = cart.entries[0];
    const item2 = cart.entries[1];

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
    cart.attach(localStorage, deathCertificatesDao, siteAnalytics);

    cart.setQuantity(CERT_1, 5);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([{ id: CERT_1.id, quantity: 5 }])
    );
  });
});
