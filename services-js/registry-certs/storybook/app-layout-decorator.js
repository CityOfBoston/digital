// @flow
/* eslint react/display-name: 0 */

import React, { type Element as ReactElement } from 'react';

import Cart from '../client/store/Cart';

import AppLayout from '../client/AppLayout';
import type { LinkOptions } from '../client/common/Nav';

export default (link: ?LinkOptions) => (next: () => ReactElement<*>) => (
  <AppLayout navProps={link ? { cart: new Cart(), link } : null}>
    {next()}
  </AppLayout>
);
