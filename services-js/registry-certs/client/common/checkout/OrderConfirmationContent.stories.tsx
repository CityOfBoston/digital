import React from 'react';
import { storiesOf } from '@storybook/react';

import OrderConfirmationContent from './OrderConfirmationContent';

storiesOf('Common Components/Checkout/OrderConfirmationContent', module)
  .add('birth', () => (
    <OrderConfirmationContent
      certificateType="birth"
      orderId="12345"
      contactEmail="me@email.com"
      stepCount={8}
    />
  ))
  .add('marriage', () => (
    <OrderConfirmationContent
      certificateType="marriage"
      orderId="12345"
      contactEmail="me@email.com"
      stepCount={8}
    />
  ));
