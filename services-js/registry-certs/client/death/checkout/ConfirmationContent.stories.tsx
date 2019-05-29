import React from 'react';
import { storiesOf } from '@storybook/react';

import ConfirmationContent from './ConfirmationContent';
import Cart from '../../store/DeathCertificateCart';

storiesOf('Death/ConfirmationContent', module).add('default', () => (
  <ConfirmationContent
    orderId="123-4444-5"
    contactEmail="ttoe@squirrelzone.net"
    cart={new Cart()}
  />
));
