// @flow

import CartPage from './CartPage';

describe('integration', () => {
  it('renders', () => {
    expect(new CartPage().render()).toMatchSnapshot();
  });
});
