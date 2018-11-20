import React from 'react';
import { storiesOf } from '@storybook/react';

import ServiceFeeDisclosure, {
  serviceFeeDisclosureText,
} from './ServiceFeeDisclosure';

storiesOf('Common Components/ServiceFeeDisclosure', module)
  .add('component', () => <ServiceFeeDisclosure />)
  .add('text string', () => <p>{serviceFeeDisclosureText()}</p>);
