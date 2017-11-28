// @flow

import { observable, computed } from 'mobx';
import makeShippingValidator, {
  type ShippingValidator,
} from '../../lib/validators/ShippingValidator';
import makePaymentValidator, {
  type PaymentValidator,
} from '../../lib/validators/PaymentValidator';

// Session-storage based container for keeping track of ordering info. Only add
// values here that should be in session storage.
export type OrderInfo = {|
  storeContactAndShipping: boolean,
  storeBilling: boolean,

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
  cardToken: ?string,
  cardLast4: ?string,

  billingAddressSameAsShippingAddress: boolean,

  billingAddress1: string,
  billingAddress2: string,
  billingCity: string,
  billingState: string,
  billingZip: string,
|};

export default class Order {
  @observable info: OrderInfo;

  @observable cardElementError: ?string = null;
  @observable cardElementComplete: boolean = false;

  // Set to true if there's a network operation related to the order going on,
  // such as tokenizing the card with Stripe or submitting the order to the
  // backend.
  @observable processing: boolean = false;

  // An error string arising from a network operation, suck as tokenizing the
  // card with Stripe or submitting the order to the backend.
  @observable processingError: ?string = null;

  updateStorageDisposer: ?Function = null;

  constructor(info: ?OrderInfo = null) {
    this.info = info || {
      storeContactAndShipping: false,
      storeBilling: false,

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
      cardToken: null,
      cardLast4: null,

      billingAddressSameAsShippingAddress: true,

      billingAddress1: '',
      billingAddress2: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
    };
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
    const validator = makePaymentValidator(this.info);
    validator.check();
    return validator;
  }

  @computed
  get paymentIsComplete(): boolean {
    return this.paymentValidator.passes();
  }

  @computed
  get paymentErrors(): { [any]: Array<string> } {
    return this.paymentValidator.errors.all();
  }

  @computed
  get billingAddress1(): string {
    return this.info.billingAddressSameAsShippingAddress
      ? this.info.shippingAddress1
      : this.info.billingAddress1;
  }

  @computed
  get billingAddress2(): string {
    return this.info.billingAddressSameAsShippingAddress
      ? this.info.shippingAddress2
      : this.info.billingAddress2;
  }

  @computed
  get billingCity(): string {
    return this.info.billingAddressSameAsShippingAddress
      ? this.info.shippingCity
      : this.info.billingCity;
  }

  @computed
  get billingState(): string {
    return this.info.billingAddressSameAsShippingAddress
      ? this.info.shippingState
      : this.info.billingState;
  }

  @computed
  get billingZip(): string {
    return this.info.billingAddressSameAsShippingAddress
      ? this.info.shippingZip
      : this.info.billingZip;
  }
}
