import React from 'react';
import { storiesOf } from '@storybook/react';
import Nav from './Nav';

import DeathCertificateCart from '../store/DeathCertificateCart';

storiesOf('Common Components/Nav', module).add('default', () => (
  <Nav cart={new DeathCertificateCart()} />
));
