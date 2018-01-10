// @flow

import { observable, computed, action, autorun } from 'mobx';

import type { DeathCertificate } from '../types';
import type DeathCertificatesDao from '../dao/DeathCertificatesDao';

type LocalStorageEntry = {|
  id: string,
  quantity: number,
|};

export class CartEntry {
  id: string;
  @observable.ref cert: ?DeathCertificate;
  @observable quantity: number;
}

export default class Cart {
  @observable entries: Array<CartEntry> = [];
  @observable pendingFetches: number = 0;

  localStorageDisposer: ?Function;

  attach(localStorage: Storage, deathCertificatesDao: DeathCertificatesDao) {
    if (localStorage) {
      try {
        const savedCart: Array<LocalStorageEntry> = JSON.parse(
          localStorage.getItem('cart') || '[]'
        );

        this.entries = savedCart.filter(({ quantity }) => quantity > 0).map(
          action(
            'hydrate entry from local storage start',
            ({ id, quantity }: LocalStorageEntry) => {
              const entry = new CartEntry();
              entry.id = id;
              entry.cert = null;
              entry.quantity = quantity;

              this.pendingFetches += 1;

              deathCertificatesDao.get(id).then(
                action(
                  'hydrate item from local storage complete',
                  (cert: ?DeathCertificate) => {
                    if (cert) {
                      entry.cert = cert;
                    } else {
                      this.remove(id);
                    }
                    this.pendingFetches -= 1;
                  }
                )
              );

              return entry;
            }
          )
        );
      } catch (e) {
        localStorage.removeItem('cart');
      }

      this.localStorageDisposer = autorun('save cart to local storage', () => {
        localStorage.setItem(
          'cart',
          JSON.stringify(
            this.entries.map(({ id, quantity }): LocalStorageEntry => ({
              id,
              quantity,
            }))
          )
        );
      });
    }
  }

  detach() {
    if (this.localStorageDisposer) {
      this.localStorageDisposer();
      this.localStorageDisposer = null;
    }
  }

  @computed
  get size(): number {
    // quantity shouldn't be below 0 but we want to be defensive.
    return this.entries.reduce(
      (acc, item) => acc + Math.max(item.quantity, 0),
      0
    );
  }

  @computed
  get loading(): boolean {
    return this.pendingFetches > 0;
  }

  add(cert: DeathCertificate, quantity: number) {
    const existingItem = this.entries.find(item => item.id === cert.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const item = new CartEntry();
      item.id = cert.id;
      item.cert = cert;
      item.quantity = quantity;

      this.entries.push(item);
    }
  }

  setQuantity(cert: DeathCertificate, quantity: number) {
    const existingItem = this.entries.find(({ id }) => id === cert.id);
    if (existingItem) {
      // We don't remove items here when their quantity is 0 so that they don't
      // disappear when you edit the values on the cart page.
      existingItem.quantity = quantity;
    } else {
      this.add(cert, quantity);
    }
  }

  remove(certId: string) {
    const idx = this.entries.findIndex(({ id }) => id === certId);

    if (idx !== -1) {
      this.entries.splice(idx, 1);
    }
  }

  getQuantity(certId: string): number {
    const entry = this.entries.find(({ id }) => id === certId);

    if (entry) {
      return entry.quantity;
    } else {
      return 0;
    }
  }

  clean() {
    this.entries = this.entries.filter(({ quantity }) => quantity > 0);
  }

  clear() {
    this.entries = [];
  }

  @computed
  get containsPending(): boolean {
    return !!this.entries.find(({ cert }) => cert && cert.pending);
  }
}
