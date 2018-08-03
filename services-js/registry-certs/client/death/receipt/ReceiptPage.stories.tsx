import React from 'react';
import { storiesOf } from '@storybook/react';

import ReceiptPage from './ReceiptPage';

import { TYPICAL_ORDER } from '../../../fixtures/client/death-certificate-orders';

storiesOf('ReceiptPage', module).add('default', () => (
  <ReceiptPage order={TYPICAL_ORDER} />
));
