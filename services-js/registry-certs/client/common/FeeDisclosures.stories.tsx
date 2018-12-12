import React from 'react';
import { storiesOf } from '@storybook/react';

import {
  researchFeeDisclosureText,
  ServiceFeeDisclosure,
  serviceFeeDisclosureText,
} from './FeeDisclosures';

storiesOf('Common Components/Fee Disclosures', module)
  .add('ServiceFeeDisclosure component', () => <ServiceFeeDisclosure />)
  .add('serviceFeeDisclosure text string', () => (
    <p>{serviceFeeDisclosureText()}</p>
  ))
  .add('researchFeeDisclosure text string', () => (
    <p>{researchFeeDisclosureText()}</p>
  ));
