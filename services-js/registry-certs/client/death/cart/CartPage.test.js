// @flow

import CartPage from './CartPage';

describe('integration', () => {
  it('renders', () => {
    expect(CartPage()).toMatchSnapshot();
  });
});
