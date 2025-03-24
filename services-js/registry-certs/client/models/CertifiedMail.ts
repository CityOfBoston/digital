import { observable, computed, action } from 'mobx';

// Session-storage based container for keeping track of `Certified Mail` info.
// Only add values here that should be in session storage.

export interface CertMailProps {
  requestCertifiedMail: boolean;
}

export default class CertifiedMail {
  @observable certMailInfo: CertMailProps = null as any;

  idempotencyKey: string | null = null;

  // Set to true if there's a network operation related to the order going on,
  // such as tokenizing the card with Stripe or submitting the order to the
  // backend.
  @observable processing: boolean = false;

  updateStorageDisposer: Function | null = null;

  readonly localStorageAvailable: boolean;

  constructor(
    certMailInfo: CertMailProps | null = null,
    localStorageAvailable = true
  ) {
    this.localStorageAvailable = localStorageAvailable;

    this.certMailInfo = certMailInfo || {
      requestCertifiedMail: false,
    };
  }

  @action
  /**
   * Modifies the info data by updating it with the provided data. Really just a
   * type-safe wrapper around Object.assign.
   */
  updateCertMail(partialCertMail: Partial<CertMailProps>) {
    // TIL: TypeScript’s typing of Object.assign does not guarantee that the
    // first parameter (which gets mutated) maintains its type.
    Object.assign(this.certMailInfo, partialCertMail);
  }

  @computed
  get certMailInfoEnabled(): boolean {
    return this.certMailInfo.requestCertifiedMail
      ? this.certMailInfo.requestCertifiedMail
      : false;
  }

  @action
  resetCertMail() {
    this.certMailInfo.requestCertifiedMail = false;
  }

  @action
  enableCertMail() {
    this.certMailInfo.requestCertifiedMail = true;
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
