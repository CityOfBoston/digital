// @flow

import { runInAction } from 'mobx';

import Order, { type OrderInfo } from './Order';

describe('attach', () => {
  let sessionStorage: any;
  let order: Order;

  beforeEach(() => {
    sessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };

    order = new Order();
  });

  afterEach(() => {
    order.detach();
  });

  it('hydrates from local storage', () => {
    sessionStorage.getItem.mockReturnValue(
      JSON.stringify(
        ({
          contactName: 'Tippy Toe',
          contactEmail: '',
          contactPhone: '',

          shippingName: '',
          shippingAddress1: '',
          shippingAddress2: '',
          shippingCity: '',
          shippingState: '',
          shippingZip: '',

          billingAddress1: '',
          billingAddress2: '',
          billingCity: '',
          billingState: '',
          billingZip: '',
        }: OrderInfo)
      )
    );
    order.attach(sessionStorage);
    expect(order.info.contactName).toEqual('Tippy Toe');
  });

  it('updates local storage with new values', () => {
    order.attach(sessionStorage);

    runInAction(() => {
      order.info.contactEmail = 'ttoe@squirrelzone.net';
    });

    const newItem = sessionStorage.setItem.mock.calls.pop()[1];
    const newOrderInfo: OrderInfo = JSON.parse(newItem);

    expect(newOrderInfo.contactEmail).toEqual('ttoe@squirrelzone.net');
  });
});
