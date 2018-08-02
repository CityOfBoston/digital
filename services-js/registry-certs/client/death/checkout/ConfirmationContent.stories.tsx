import React from 'react';
import { storiesOf } from '@storybook/react';

import ConfirmationContent from './ConfirmationContent';

storiesOf('ConfirmationContent', module).add('default', () => (
  <ConfirmationContent
    orderId="123-4444-5"
    contactEmail="ttoe@squirrelzone.net"
  />
));
