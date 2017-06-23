// @flow

import { observable, computed, action, autorun } from 'mobx';

import type { DeathCertificate } from '../types';
import type DeathCertificatesDao from '../dao/DeathCertificatesDao';

export const CERTIFICATE_COST = 14;
export const PROCESSING_FEE = 0.0275;

type LocalStorageItem = {|
  id: string,
  quantity: number,
|};

export class CartItem {
  id: string;
  @observable.ref cert: ?DeathCertificate;
  @observable quantity: number;
}

export default class Cart {
  @observable items = [];
  @observable pendingFetches: number = 0;

  localStorageDisposer: ?Function;

  attach(localStorage: Storage, deathCertificatesDao: DeathCertificatesDao) {
    if (localStorage) {
      try {
        const savedCart: Array<LocalStorageItem> = JSON.parse(
          localStorage.getItem('cart') || '[]',
        );
        this.items = savedCart.map(
          action(
            'hydrate item from local storage start',
            ({ id, quantity }: LocalStorageItem) => {
              const item = new CartItem();
              item.id = id;
              item.cert = null;
              item.quantity = quantity;

              this.pendingFetches += 1;

              deathCertificatesDao.get(id).then(
                action(
                  'hydrate item from local storage complete',
                  (cert: ?DeathCertificate) => {
                    item.cert = cert;
                    this.pendingFetches -= 1;
                  },
                ),
              );

              return item;
            },
          ),
        );
      } catch (e) {
        localStorage.removeItem('cart');
      }

      this.localStorageDisposer = autorun('save cart to local storage', () => {
        localStorage.setItem(
          'cart',
          JSON.stringify(
            this.items.map(({ id, quantity }): LocalStorageItem => ({
              id,
              quantity,
            })),
          ),
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
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  @computed
  get loading(): boolean {
    return this.pendingFetches > 0;
  }

  @computed
  get cost(): number {
    return (
      Math.ceil(this.size * CERTIFICATE_COST * (1 + PROCESSING_FEE) * 100) / 100
    );
  }

  @action
  add(cert: DeathCertificate, quantity: number) {
    const existingItem = this.items.find(item => item.id === cert.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const item = new CartItem();
      item.id = cert.id;
      item.cert = cert;
      item.quantity = quantity;

      this.items.push(item);
    }
  }

  @action
  setQuantity(certId: string, quantity: number) {
    const existingItem = this.items.find(({ id }) => id === certId);
    if (existingItem) {
      existingItem.quantity = quantity;
    }
  }

  @action
  remove(certId: string) {
    const idx = this.items.findIndex(({ id }) => id === certId);
    if (idx !== -1) {
      this.items.splice(idx, 1);
    }
  }
}
