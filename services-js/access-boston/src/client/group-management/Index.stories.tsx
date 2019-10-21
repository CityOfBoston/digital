import React from 'react';
import { storiesOf } from '@storybook/react';

import Index from './Index';

storiesOf('GroupManagementPage/Index', module).add('default', () => (
  <Index groups={[]} />
));
