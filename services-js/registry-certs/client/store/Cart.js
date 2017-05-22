// @flow

import { observable, computed, action } from 'mobx';

import type { DeathCertificate } from '../types';

export class CartItem {
  @observable.ref cert: DeathCertificate;
  @observable quantity: number;
}

export default class Cart {
  @observable items = [];

  @computed get size(): number {
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  @action add(cert: DeathCertificate, quantity: number) {
    const existingItem = this.items.find((item) => item.cert.id === cert.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const item = new CartItem();
      item.cert = cert;
      item.quantity = quantity;

      this.items.push(item);
    }
  }

  @action setQuantity(certId: string, quantity: number) {
    const existingItem = this.items.find((item) => item.cert.id === certId);
    if (existingItem) {
      existingItem.quantity = quantity;
    }
  }

  @action remove(certId: string) {
    const idx = this.items.findIndex(({ cert }) => cert.id === certId);
    if (idx !== -1) {
      this.items.splice(idx, 1);
    }
  }
}
