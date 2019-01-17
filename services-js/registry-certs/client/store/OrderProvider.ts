import { autorun, observable, action } from 'mobx';
import Order, { OrderInfo } from '../models/Order';

export const LOCAL_STORAGE_KEY = 'order';
export const SESSION_STORAGE_KEY = 'order';

/**
 * Class to provide Order objects that are pre-populated from storage and can
 * write back to it.
 *
 * We use localStorage to save address information if the user explicitly opts
 * in to it.
 *
 * We use sessionStorage to keep the order while the forms are being filled out.
 */
export default class OrderProvider {
  @observable.ref private localStorage: Storage | null = null;
  @observable.ref private sessionStorage: Storage | null = null;

  private attached: boolean = false;
  private orderResolveFns: Array<(Order) => unknown> = [];

  @action
  attach(localStorage: Storage | null, sessionStorage: Storage | null) {
    this.localStorage = localStorage;
    this.sessionStorage = sessionStorage;
    this.attached = true;

    this.orderResolveFns.forEach(fn => {
      fn(this.getOrderInternal());
    });
    this.orderResolveFns.length = 0;
  }

  @action
  detach() {
    this.localStorage = null;
    this.sessionStorage = null;
    this.attached = false;
  }

  /**
   * Returns a Promise that will resolve to an Order once we have attached.
   * Ensures that if there is localStorage / sessionStorage data to initialize
   * with then we’ve loaded it.
   */
  get(): Promise<Order> {
    if (this.attached) {
      return Promise.resolve(this.getOrderInternal());
    } else {
      return new Promise(resolve => {
        this.orderResolveFns.push(resolve);
      });
    }
  }

  private getOrderInternal(): Order {
    const { localStorage, sessionStorage } = this;

    let orderInfo: OrderInfo | null = null;

    // Session storage is where the current order is saved.
    if (sessionStorage) {
      try {
        orderInfo = JSON.parse(
          sessionStorage.getItem(SESSION_STORAGE_KEY) || 'null'
        );
      } catch (e) {
        // safety valve
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }

    if (!orderInfo && localStorage) {
      try {
        orderInfo = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_KEY) || 'null'
        );
      } catch (e) {
        // safety valve
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }

    const order = new Order(orderInfo, !!localStorage);

    autorun(
      () => {
        const { localStorage } = this;

        if (!localStorage) {
          return;
        }

        if (order.info.storeContactAndShipping || order.info.storeBilling) {
          const value = JSON.stringify(this.permanentStorageInfo(order.info));
          localStorage.setItem(LOCAL_STORAGE_KEY, value);
        } else {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      },
      {
        name: 'Order -> localStorage',
      }
    );

    autorun(
      () => {
        const { sessionStorage } = this;

        if (!sessionStorage) {
          return;
        }

        // Unlike localStorage, the sessionStorage values are unfiltered and
        // always saved.
        const value = JSON.stringify(order.info);
        sessionStorage.setItem(SESSION_STORAGE_KEY, value);
      },
      {
        name: 'Order -> sessionStorage',
      }
    );

    return order;
  }

  /**
   * Removes the order from session storage. Call this after the order is
   * submitted successfully.
   */
  clear() {
    const { sessionStorage } = this;

    if (sessionStorage) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  /**
   * Returns a filtered OrderInfo based on the values of storeContactAndShipping
   * and storeBilling. If either is true, include its value, otherwise include an empty string
   * false.
   *
   * Does not return any card token information.
   */
  private permanentStorageInfo(info: OrderInfo): OrderInfo {
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
      cardToken: null,
      cardFunding: 'unknown',

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
