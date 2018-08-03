import { autorun, observable } from 'mobx';
import Order, { OrderInfo } from '../models/Order';

export const LOCAL_STORAGE_KEY = 'order';

// Class to provide Order objects that are pre-populated from localStorage, and
// to save order info back to localStorage.
export default class OrderProvider {
  @observable.ref localStorage: Storage | null = null;

  attach(localStorage: Storage | null) {
    this.localStorage = localStorage;
  }

  get(): Order {
    const { localStorage } = this;

    let orderInfo: OrderInfo | null = null;

    if (localStorage) {
      try {
        orderInfo = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_KEY) || 'null'
        );
      } catch (e) {
        // safety valve
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }

    const order = new Order(orderInfo);

    autorun(() => {
      const { localStorage } = this;

      if (!localStorage) {
        return;
      }

      if (order.info.storeContactAndShipping || order.info.storeBilling) {
        const value = JSON.stringify(this.storableInfo(order.info));
        localStorage.setItem(LOCAL_STORAGE_KEY, value);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    });

    return order;
  }

  // Returns a filtered OrderInfo based on the values of storeContactAndShipping
  // and storeBilling. If they're true, includes the related values, '' if
  // false.
  storableInfo(info: OrderInfo): OrderInfo {
    const { storeContactAndShipping, storeBilling } = info;

    const outInfo: OrderInfo = {
      storeContactAndShipping,
      storeBilling,

      contactName: storeContactAndShipping ? info.contactName : '',
      contactEmail: storeContactAndShipping ? info.contactEmail : '',
      contactPhone: storeContactAndShipping ? info.contactPhone : '',

      shippingName: storeContactAndShipping ? info.shippingName : '',
      shippingCompanyName: storeContactAndShipping
        ? info.shippingCompanyName
        : '',
      shippingAddress1: storeContactAndShipping ? info.shippingAddress1 : '',
      shippingAddress2: storeContactAndShipping ? info.shippingAddress2 : '',
      shippingCity: storeContactAndShipping ? info.shippingCity : '',
      shippingState: storeContactAndShipping ? info.shippingState : '',
      shippingZip: storeContactAndShipping ? info.shippingZip : '',

      // not stored
      cardholderName: '',
      cardLast4: '4040',

      billingAddressSameAsShippingAddress: storeBilling
        ? info.billingAddressSameAsShippingAddress
        : true,

      billingAddress1: storeBilling ? info.billingAddress1 : '',
      billingAddress2: storeBilling ? info.billingAddress2 : '',
      billingCity: storeBilling ? info.billingCity : '',
      billingState: storeBilling ? info.billingState : '',
      billingZip: storeBilling ? info.billingZip : '',
    };

    return outInfo;
  }
}
