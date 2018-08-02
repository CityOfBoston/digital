import React from 'react';
import { storiesOf } from '@storybook/react';
import Nav from './Nav';

import Cart from '../store/Cart';

storiesOf('Nav', module).add('default', () => <Nav cart={new Cart()} />);
