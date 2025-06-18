import { observable, action } from 'mobx';

// Session-storage based container for keeping track of `Certified Mail` info.
// Only add values here that should be in session storage.

export type CARDTYPE = '-1' | '0' | '1';

export interface CardTypesProps {
  cardType: CARDTYPE;
}

export default class CardType {
  @observable cardTypeInfo: CardTypesProps = null as any;
  idempotencyKey: string | null = null;

  readonly localStorageAvailable: boolean;

  constructor(
    cardTypeInfo: CardTypesProps | null = null,
    localStorageAvailable = true
  ) {
    this.localStorageAvailable = localStorageAvailable;

    this.cardTypeInfo = cardTypeInfo || {
      cardType: '-1',
    };
  }

  @action
  /**
   * Modifies the info data by updating it with the provided data. Really just a
   * type-safe wrapper around Object.assign.
   */
  updateCardType(partialCertMail: Partial<CardTypesProps>) {
    // TIL: TypeScript’s typing of Object.assign does not guarantee that the
    // first parameter (which gets mutated) maintains its type.
    Object.assign(this.cardTypeInfo, partialCertMail);
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
