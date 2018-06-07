import React from 'react';
import { storiesOf } from '@storybook/react';

import ApplyPage from '../pages/commissions/apply';

storiesOf('ApplyPage', module).add('default', () => (
  <ApplyPage commissions={[]} />
));
