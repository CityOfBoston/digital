import { observable, computed, action, autorun } from 'mobx';

import { DeathCertificate } from '../types';
import DeathCertificatesDao from '../dao/DeathCertificatesDao';
import SiteAnalytics from '../lib/SiteAnalytics';

import { CERTIFICATE_COST } from '../../lib/costs';

interface LocalStorageEntry {
  id: string;
  quantity: number;
}

export class CartEntry {
  id: string = '';
  @observable.ref cert: DeathCertificate | null = null;
  @observable quantity: number = 0;
}

export default class Cart {
  @observable entries: Array<CartEntry> = [];
  @observable pendingFetches: number = 0;

  localStorageDisposer: Function | null = null;
  siteAnalytics: SiteAnalytics | null = null;

  attach(
    localStorage: Storage,
    deathCertificatesDao: DeathCertificatesDao,
    siteAnalytics: SiteAnalytics
  ) {
    this.siteAnalytics = siteAnalytics;

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
                  (cert: DeathCertificate | null) => {
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

      this.localStorageDisposer = autorun(
        () => {
          localStorage.setItem(
            'cart',
            JSON.stringify(
              this.entries.map(({ id, quantity }): LocalStorageEntry => ({
                id,
                quantity,
              }))
            )
          );
        },
        {
          name: 'save cart to local storage',
        }
      );
    }
  }

  detach() {
    if (this.localStorageDisposer) {
      this.localStorageDisposer();
      this.localStorageDisposer = null;
    }

    this.siteAnalytics = null;
  }

  trackCartItems() {
    const { siteAnalytics } = this;
    if (!siteAnalytics) {
      return;
    }

    this.entries.forEach(({ id, quantity }) => {
      siteAnalytics.addProduct(
        id,
        'Death certificate',
        'Death certificate',
        quantity,
        CERTIFICATE_COST / 100
      );
    });
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

  setQuantity(cert: DeathCertificate, quantity: number) {
    const { siteAnalytics } = this;

    const existingItem = this.entries.find(({ id }) => id === cert.id);
    const filteredQuantity = Math.max(0, Math.min(99, quantity));

    const quantityChange = quantity - this.getQuantity(cert.id);

    if (siteAnalytics) {
      siteAnalytics.addProduct(
        cert.id,
        'Death certificate',
        'Death certificate',
        Math.abs(quantityChange),
        CERTIFICATE_COST / 100
      );
      siteAnalytics.setProductAction(quantityChange < 0 ? 'remove' : 'add');
    }

    if (existingItem) {
      // We don't remove items here when their quantity is 0 so that they don't
      // disappear when you edit the values on the cart page.
      existingItem.quantity = filteredQuantity;
    } else {
      const item = new CartEntry();
      item.id = cert.id;
      item.cert = cert;
      item.quantity = filteredQuantity;

      this.entries.push(item);
    }
  }

  remove(certId: string) {
    const { siteAnalytics } = this;
    const idx = this.entries.findIndex(({ id }) => id === certId);

    if (idx !== -1) {
      if (siteAnalytics) {
        siteAnalytics.addProduct(
          certId,
          'Death certificate',
          'Death certificate',
          this.getQuantity(certId),
          CERTIFICATE_COST / 100
        );
        siteAnalytics.setProductAction('remove');
      }

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
    return !!this.entries.find(({ cert }) => !!(cert && cert.pending));
  }
}
