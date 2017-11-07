// @flow

import { observable, action, autorun, computed } from 'mobx';
import makeShippingValidator, {
  type ShippingValidator,
} from '../../lib/validators/ShippingValidator';
import makePaymentValidator, {
  type PaymentValidator,
} from '../../lib/validators/PaymentValidator';

// session-storage based container for keeping track of ordering info

export type OrderInfo = {|
  contactName: string,
  contactEmail: string,
  contactPhone: string,

  shippingName: string,
  shippingCompanyName: string,
  shippingAddress1: string,
  shippingAddress2: string,
  shippingCity: string,
  shippingState: string,
  shippingZip: string,

  cardholderName: string,

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
      shippingCompanyName: '',
      shippingAddress1: '',
      shippingAddress2: '',
      shippingCity: '',
      shippingState: '',
      shippingZip: '',

      cardholderName: '',

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
  get shippingValidator(): ShippingValidator {
    const validator = makeShippingValidator(this.info);
    validator.check();
    return validator;
  }

  @computed
  get shippingIsComplete(): boolean {
    return this.shippingValidator.passes();
  }

  @computed
  get shippingErrors(): { [any]: Array<string> } {
    return this.shippingValidator.errors.all();
  }

  @computed
  get paymentValidator(): PaymentValidator {
    // Object spread to make sure we get mobX dependencies on all the keys,
    // since they're not dereferenced until "check" later.
    return makePaymentValidator({ ...this.info });
  }

  @computed
  get paymentIsComplete(): boolean {
    return this.paymentValidator.passes();
  }

  @computed
  get paymentErrors(): { [any]: Array<string> } {
    return this.paymentValidator.errors.all();
  }
}
