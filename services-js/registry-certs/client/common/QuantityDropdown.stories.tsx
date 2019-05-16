import React from 'react';

import { storiesOf } from '@storybook/react';

import { CenterWrapper } from '@cityofboston/storybook-common';

import QuantityDropdown from './QuantityDropdown';

storiesOf('Common Components/QuantityDropdown', module).add('default', () => (
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    <CenterWrapper>
      <QuantityDropdown handleQuantityChange={() => {}} quantity={0} />
    </CenterWrapper>
  </div>
));
