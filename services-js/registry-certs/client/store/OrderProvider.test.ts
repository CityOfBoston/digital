import OrderProvider, {
  LOCAL_STORAGE_KEY,
  SESSION_STORAGE_KEY,
} from './OrderProvider';
import Order, { OrderInfo } from '../models/Order';

class FakeStorage implements Storage {
  store = {};

  getItem = (key: string): string => this.store[key];

  setItem = (key: string, value: string) => {
    this.store[key] = value;
  };

  removeItem = (key: string) => {
    delete this.store[key];
  };

  key = (i: number) => {
    return Object.keys(this.store)[i];
  };

  get length() {
    return Object.keys(this.store).length;
  }

  clear = () => {
    this.store = {};
  };
}

describe('storage', () => {
  let localStorage: Storage;
  let sessionStorage: Storage;
  let orderProvider: OrderProvider;

  beforeEach(() => {
    localStorage = new FakeStorage();
    sessionStorage = new FakeStorage();

    orderProvider = new OrderProvider();
    orderProvider.attach(localStorage, sessionStorage);
  });

  it('initializes order from session storage', async () => {
    const orderInfo: OrderInfo = {
      storeContactAndShipping: true,
      storeBilling: false,

      contactName: 'Squirrel Girl',
      contactEmail: 'squirrel.girl@avengers.org',
      contactPhone: '(555) 123-9999',

      shippingName: 'Doreen Green',
      shippingCompanyName: 'Empire State University',
      shippingAddress1: 'Dorm Hall, Apt 5',
      shippingAddress2: '10 College Avenue',
      shippingCity: 'New York',
      shippingState: 'NY',
      shippingZip: '12345',

      cardholderName: 'Nancy Whitehead',
      cardLast4: '4040',
      cardToken: 'tok_testtoken',
      cardFunding: 'credit',

      billingAddressSameAsShippingAddress: true,

      billingAddress1: '',
      billingAddress2: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
    };

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(orderInfo));

    const order = await orderProvider.get();

    expect(order.info.contactName).toEqual('Squirrel Girl');
  });

  it('initializes order from local storage', async () => {
    const orderInfo: OrderInfo = {
      storeContactAndShipping: true,
      storeBilling: false,

      contactName: 'Squirrel Girl',
      contactEmail: 'squirrel.girl@avengers.org',
      contactPhone: '(555) 123-9999',

      shippingName: 'Doreen Green',
      shippingCompanyName: 'Empire State University',
      shippingAddress1: 'Dorm Hall, Apt 5',
      shippingAddress2: '10 College Avenue',
      shippingCity: 'New York',
      shippingState: 'NY',
      shippingZip: '12345',

      cardholderName: '',
      cardLast4: '4040',
      cardToken: null,
      cardFunding: 'unknown',

      billingAddressSameAsShippingAddress: true,

      billingAddress1: '',
      billingAddress2: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orderInfo));

    const order = await orderProvider.get();

    expect(order.info.contactName).toEqual('Squirrel Girl');
  });

  it('saves shipping after checking the box, deletes it later', async () => {
    const order = await orderProvider.get();

    order.info.contactName = 'Tippy Toe';

    expect(
      JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}')['contactName']
    ).toBeUndefined();

    order.info.storeContactAndShipping = true;

    expect(
      JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}')['contactName']
    ).toEqual('Tippy Toe');

    order.info.storeContactAndShipping = false;

    expect(
      JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}')['contactName']
    ).toBeUndefined();
  });

  it('saves billing after checking the box, deletes it later', async () => {
    const order = await orderProvider.get();

    order.info.billingAddress1 = '10 College Avenue';

    expect(
      JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}')[
        'billingAddress1'
      ]
    ).toBeUndefined();

    order.info.storeBilling = true;

    expect(
      JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}')[
        'billingAddress1'
      ]
    ).toEqual('10 College Avenue');

    order.info.storeBilling = false;

    expect(
      JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}')[
        'billingAddress1'
      ]
    ).toBeUndefined();
  });
});

describe('promises', () => {
  it('resolves a promise once attachment happens', async () => {
    const orderProvider = new OrderProvider();
    const orderPromise = orderProvider.get();

    orderProvider.attach(null, null);

    // Failure here is a timeout from this never resolving
    await expect(orderPromise).resolves.toBeInstanceOf(Order);
  });

  it('resolves promises once it’s been attached', async () => {
    const orderProvider = new OrderProvider();
    orderProvider.attach(null, null);

    const orderPromise = orderProvider.get();

    // Failure here is a timeout from this never resolving
    await expect(orderPromise).resolves.toBeInstanceOf(Order);
  });
});
