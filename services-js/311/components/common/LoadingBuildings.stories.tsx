import React from 'react';
import { storiesOf } from '@storybook/react';
import LoadingBuildings from './LoadingBuildings';

storiesOf('LoadingBuildings', module)
  .addDecorator(next => <div className="b-c">{next()}</div>)
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
