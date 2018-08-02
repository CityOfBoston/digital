import Order from './Order';

describe('shippingIsComplete', () => {
  it('is false when blank', () => {
    const order = new Order();
    expect(order.shippingIsComplete).toBe(false);
  });
});
