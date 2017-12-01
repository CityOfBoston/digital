// @flow
/* eslint react/display-name: 0 */

import React, { type Element as ReactElement } from 'react';

import Cart from '../client/store/Cart';

import AppLayout from '../client/AppLayout';

export default (showNav: boolean) => (next: () => ReactElement<*>) => (
  <AppLayout navProps={showNav ? { cart: new Cart() } : null}>
    {next()}
  </AppLayout>
);
