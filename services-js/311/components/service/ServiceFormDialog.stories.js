// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';
import ServiceFormDialog from './ServiceFormDialog';

storiesOf('ServiceFormDialog', module)
.add('Not Found', () => (
  <ServiceFormDialog service={null} />
));
