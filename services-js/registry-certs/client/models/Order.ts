import { observable, computed, action } from 'mobx';
import makeShippingValidator, {
  ShippingValidator,
} from '../../lib/validators/ShippingValidator';
import makePaymentValidator, {
  PaymentValidator,
} from '../../lib/validators/PaymentValidator';

// Session-storage based container for keeping track of ordering info. Only add
// values here that should be in session storage.
export interface OrderInfo {
  storeContactAndShipping: boolean;
  storeBilling: boolean;

  contactName: string;
  contactEmail: string;
  contactPhone: string;

  shippingName: string;
  shippingCompanyName: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;

  cardholderName: string;
  cardLast4: string;
  cardToken: string | null;
  cardFunding: 'credit' | 'debit' | 'prepaid' | 'unknown';

  billingAddressSameAsShippingAddress: boolean;

  billingAddress1: string;
  billingAddress2: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
}

export default class Order {
  @observable info: OrderInfo = null as any;

  idempotencyKey: string | null = null;

  // Set to true if there's a network operation related to the order going on,
  // such as tokenizing the card with Stripe or submitting the order to the
  // backend.
  @observable processing: boolean = false;

  updateStorageDisposer: Function | null = null;

  readonly localStorageAvailable: boolean;

  constructor(info: OrderInfo | null = null, localStorageAvailable = true) {
    this.localStorageAvailable = localStorageAvailable;

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
      shippingState: 'MA',
      shippingZip: '',

      cardholderName: '',
      cardLast4: '',
      cardToken: null,
      cardFunding: 'unknown',

      billingAddressSameAsShippingAddress: true,

      billingAddress1: '',
      billingAddress2: '',
      billingCity: '',
      billingState: 'MA',
      billingZip: '',
    };
  }

  @action
  /**
   * Modifies the info data by updating it with the provided data. Really just a
   * type-safe wrapper around Object.assign.
   */
  updateInfo(partialInfo: Partial<OrderInfo>) {
    // TIL: TypeScript’s typing of Object.assign does not guarantee that the
    // first parameter (which gets mutated) maintains its type.
    Object.assign(this.info, partialInfo);
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
  get shippingErrors(): { [key: string]: Array<string> } {
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
    return this.paymentValidator.passes() && this.info.cardToken !== null;
  }

  @computed
  get paymentErrors(): { [key: string]: Array<string> } {
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

  @action
  resetCard() {
    this.info.cardToken = null;
    this.info.cardFunding = 'credit';
    this.info.cardLast4 = '';
  }

  // We use an idempotency key to prevent double-clicks on submit from
  // generating mulitple orders (though disabling submit during submission helps
  // as well).
  regenerateIdempotencyKey() {
    this.idempotencyKey = Math.random()
      .toString(36)
      .substring(2, 9);
  }
}
