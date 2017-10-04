// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import AddedToCartPopup from './AddedToCartPopup';

import { TYPICAL_CERTIFICATE } from '../../../fixtures/client/death-certificates';

storiesOf('AddedToCartPopup', module).add('normal certificate', () => (
  <AddedToCartPopup
    certificate={TYPICAL_CERTIFICATE}
    quantity={5}
    close={action('close')}
  />
));
