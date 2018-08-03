type Category = 'UX';
type ProductAction = 'detail' | 'add' | 'remove' | 'checkout' | 'purchase';
type ProductCategory = 'Death certificate';

// class to wrap Google Analylitcs for sending events
export default class SiteAnalytics {
  ga: Function | null = null;

  attach(ga: Function) {
    this.ga = ga;
  }

  addImpression(
    id: string,
    category: ProductCategory,
    list: string,
    position: number
  ) {
    const { ga } = this;
    if (!ga) {
      return;
    }

    ga('ec:addImpression', {
      id,
      category,
      list,
      position,
    });
  }

  addProduct(
    id: string,
    name: string,
    category: ProductCategory,
    quantity?: number,
    price?: number
  ) {
    const { ga } = this;
    if (!ga) {
      return;
    }

    ga('ec:addProduct', {
      id,
      name,
      category,
      quantity,
      price,
    });
  }

  setProductAction(action: ProductAction, options?: Object) {
    const { ga } = this;
    if (!ga) {
      return;
    }
    ga('ec:setAction', action, options || {});
  }

  sendEvent(
    eventCategory: Category,
    eventAction: string,
    eventLabel?: string,
    eventValue?: number | null
  ) {
    const { ga } = this;

    if (!ga) {
      return;
    }

    ga('send', {
      hitType: 'event',
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
    });
  }
}
