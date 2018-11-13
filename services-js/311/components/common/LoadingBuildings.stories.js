// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';
import LoadingBuildings from './LoadingBuildings';

storiesOf('LoadingBuildings', module)
  .add('loading', () => (
    <div style={{ width: 400, height: 400 }}>
      <LoadingBuildings />
    </div>
  ))
  .add('reduced motion', () => (
    <div style={{ width: 400, height: 400 }}>
      <LoadingBuildings reduceMotion />
    </div>
  ));
