// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';
import Nav from './Nav';

import Cart from '../store/Cart';

storiesOf('Nav', module)
  .add('normal page', () => (
    <Nav cart={new Cart()} link="checkout" />
  ))
  .add('checkout page', () => (
    <Nav cart={new Cart()} link="lookup" />
  ));
