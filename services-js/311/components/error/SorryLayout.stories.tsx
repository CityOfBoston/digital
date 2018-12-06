import React from 'react';
import { storiesOf } from '@storybook/react';

import page from '../../.storybook/page';
import SorryLayout from './SorryLayout';

storiesOf('SorryLayout', module)
  .addDecorator(page)
  .add('default', () => <SorryLayout />);
