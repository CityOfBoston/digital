// @flow

import { observable, action, autorun, computed } from 'mobx';

// session-storage based container for keeping track of ordering info

export type OrderInfo = {|
  contactName: string,
  contactEmail: string,
  contactPhone: string,

  shippingName: string,
  shippingAddress1: string,
  shippingAddress2: string,
  shippingCity: string,
  shippingState: string,
  shippingZip: string,

  billingAddressSameAsShippingAddress: boolean,

  billingAddress1: string,
  billingAddress2: string,
  billingCity: string,
  billingState: string,
  billingZip: string,
|};

const LOCAL_STORAGE_KEY = 'order';

export default class Order {
  @observable info: OrderInfo;

  updateStorageDisposer: ?Function = null;

  constructor() {
    this.info = {
      contactName: '',
      contactEmail: '',
      contactPhone: '',

      shippingName: '',
      shippingAddress1: '',
      shippingAddress2: '',
      shippingCity: '',
      shippingState: '',
      shippingZip: '',

      billingAddressSameAsShippingAddress: true,

      billingAddress1: '',
      billingAddress2: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
    };
  }

  @action
  attach(storage: Storage) {
    if (storage) {
      try {
        const savedOrderJson = storage.getItem(LOCAL_STORAGE_KEY);
        if (savedOrderJson) {
          this.info = JSON.parse(savedOrderJson);
        }
      } catch (e) {
        storage.removeItem(LOCAL_STORAGE_KEY);
      }

      this.updateStorageDisposer = autorun(
        'save order to session storage',
        () => storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.info))
      );
    }
  }

  detach() {
    if (this.updateStorageDisposer) {
      this.updateStorageDisposer();
      this.updateStorageDisposer = null;
    }
  }

  @computed
  get shippingIsComplete(): boolean {
    const {
      contactName,
      contactEmail,
      contactPhone,
      shippingName,
      shippingAddress1,
      shippingCity,
      shippingState,
      shippingZip,
    } = this.info;

    return !!(
      contactName &&
      contactEmail &&
      contactPhone &&
      shippingName &&
      shippingAddress1 &&
      shippingCity &&
      shippingState &&
      shippingZip
    );
  }

  @computed
  get billingIsComplete(): boolean {
    const {
      billingAddressSameAsShippingAddress,
      billingAddress1,
      billingCity,
      billingState,
      billingZip,
    } = this.info;

    return (
      (billingAddressSameAsShippingAddress && this.shippingIsComplete) ||
      !!(billingAddress1 && billingCity && billingState && billingZip)
    );
  }
}
