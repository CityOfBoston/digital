import React from 'react';
import { storiesOf } from '@storybook/react';

import { CHARLES_BLUE } from '@cityofboston/react-fleet';

import LastUpdated from './LastUpdated';

storiesOf('LastUpdated', module)
  .addDecorator(fn => (
    <div style={{ padding: 16, backgroundColor: CHARLES_BLUE }}>{fn()}</div>
  ))
  .add('default', () => (
    <LastUpdated lastUpdated={new Date('2019-01-07T18:56:22.431Z')} />
  ))
  .add('loading', () => <LastUpdated lastUpdated={null} />);
