// @flow

import CheckoutPage from './CheckoutPage';

describe('integration', () => {
  it('renders', () => {
    expect(CheckoutPage()).toMatchSnapshot();
  });
});
