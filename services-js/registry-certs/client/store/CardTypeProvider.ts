import { autorun, observable, action } from 'mobx';
import CardType, { CardTypesProps } from '../models/CardType';

export const LOCAL_STORAGE_CARDTYPE_KEY = 'cardtype';
export const SESSION_STORAGE_CARDTYPE_KEY = 'cardtype';

/**
 * Class to provide CardType objects that are pre-populated from storage and can
 * write back to it.
 *
 * We use localStorage to save address information if the user explicitly opts
 * in to it.
 *
 * We use sessionStorage to keep the CardType while the forms are being filled out.
 */

export default class CardTypeProvider {
  @observable.ref private localStorage: Storage | null = null;
  @observable.ref private sessionStorage: Storage | null = null;

  private attached: boolean = false;
  private cardTypeResolveFns: Array<(CardType) => unknown> = [];

  @action
  attach(localStorage: Storage | null, sessionStorage: Storage | null) {
    this.localStorage = localStorage;
    this.sessionStorage = sessionStorage;
    this.attached = true;

    this.cardTypeResolveFns.forEach(fn => {
      fn(this.getCardTypeInternal());
    });
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
  get(): Promise<CardType> {
    if (this.attached) {
      return Promise.resolve(this.getCardTypeInternal());
    } else {
      return new Promise(resolve => {
        this.cardTypeResolveFns.push(resolve);
      });
    }
  }

  public getCertInfo() {
    if (sessionStorage) {
      try {
        return JSON.parse(
          sessionStorage.getItem(SESSION_STORAGE_CARDTYPE_KEY) || 'null'
        );
      } catch (e) {
        // safety value
        console.log(`Error (getCardTypeInfo): `, e);
      }
    }
  }

  private getCardTypeInternal(): CardType {
    const { localStorage, sessionStorage } = this;

    let mailInfo: CardTypesProps | null = null;

    // Session storage is where the current cert-mail is saved.
    if (sessionStorage) {
      try {
        mailInfo = JSON.parse(
          sessionStorage.getItem(SESSION_STORAGE_CARDTYPE_KEY) || 'null'
        );
      } catch (e) {
        // safety value
        sessionStorage.removeItem(SESSION_STORAGE_CARDTYPE_KEY);
      }
    }

    if (!mailInfo && localStorage) {
      try {
        mailInfo = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_CARDTYPE_KEY) || 'null'
        );
      } catch (e) {
        // safety value
        localStorage.removeItem(LOCAL_STORAGE_CARDTYPE_KEY);
      }
    }

    const card = new CardType(mailInfo, !!localStorage);

    autorun(
      () => {
        const { localStorage } = this;

        if (!localStorage) {
          return;
        }

        if (card.cardTypeInfo.cardType) {
          const value = JSON.stringify(
            this.permanentStorageInfo(card.cardTypeInfo)
          );
          localStorage.setItem(LOCAL_STORAGE_CARDTYPE_KEY, value);
        } else {
          localStorage.removeItem(LOCAL_STORAGE_CARDTYPE_KEY);
        }
      },
      {
        name: 'CertMail: -> localStorage',
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
        const value = JSON.stringify(card.cardTypeInfo);
        sessionStorage.setItem(SESSION_STORAGE_CARDTYPE_KEY, value);
      },
      {
        name: 'Order -> sessionStorage',
      }
    );

    return card;
  }

  /**
   * Removes the order from session storage. Call this after the order is
   * submitted successfully.
   */
  clear() {
    const { sessionStorage } = this;

    if (sessionStorage) {
      sessionStorage.removeItem(SESSION_STORAGE_CARDTYPE_KEY);
    }
  }

  /**
   * Returns a filtered OrderInfo based on the values of storeContactAndShipping
   * and storeBilling. If either is true, include its value, otherwise include an empty string
   * false.
   *
   * Does not return any card token information.
   */
  private permanentStorageInfo(cardTypeInfo: CardTypesProps): CardTypesProps {
    const { cardType } = cardTypeInfo;

    const outInfo: CardTypesProps = {
      cardType: cardType ? cardType : '-1',
    };

    return outInfo;
  }
}
