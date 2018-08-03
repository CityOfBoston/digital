import OrderProvider, { LOCAL_STORAGE_KEY } from './OrderProvider';
import { OrderInfo } from '../models/Order';

class FakeLocalStorage {
  store = {};

  getItem = (key: string): string => this.store[key];

  setItem = (key: string, value: string) => {
    this.store[key] = value;
  };

  removeItem = (key: string) => {
    delete this.store[key];
  };
}

describe('storage', () => {
  let localStorage;
  let orderProvider;

  beforeEach(() => {
    localStorage = new FakeLocalStorage();

    orderProvider = new OrderProvider();
    orderProvider.attach(localStorage as any);
  });

  it('initializes order from local storage', () => {
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

      billingAddressSameAsShippingAddress: true,

      billingAddress1: '',
      billingAddress2: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orderInfo));

    const order = orderProvider.get();

    expect(order.info.contactName).toEqual('Squirrel Girl');
  });

  it('saves shipping after checking the box, deletes it later', () => {
    const order = orderProvider.get();

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

  it('saves billing after checking the box, deletes it later', () => {
    const order = orderProvider.get();

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
