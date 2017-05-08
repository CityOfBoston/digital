// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';
import LoadingIcons from './LoadingIcons';

storiesOf('LoadingIcons', module)
  .add('loading', () => (
    <div style={{ width: 200, height: 200 }}>
      <LoadingIcons initialDelay={0} />
    </div>
  ))
  .add('3 up', () => (
    <div style={{ display: 'flex', overflow: 'hidden', height: 150 }}>
      <div style={{ width: 200, height: 150 }}>
        <LoadingIcons initialDelay={0} />
      </div>
      <div style={{ width: 200, height: 150 }}>
        <LoadingIcons initialDelay={100} />
      </div>
      <div style={{ width: 200, height: 150 }}>
        <LoadingIcons initialDelay={200} />
      </div>
    </div>
  ));
