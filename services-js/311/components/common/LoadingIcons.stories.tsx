import React from 'react';
import { storiesOf } from '@storybook/react';
import LoadingIcons from './LoadingIcons';

storiesOf('LoadingIcons', module)
  .addDecorator(next => <div className="b-c">{next()}</div>)
  .add('loading', () => (
    <div style={{ width: 200, height: 200 }}>
      <LoadingIcons />
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
  ))
  .add('reduceMotion', () => (
    <div style={{ width: 200, height: 200 }}>
      <LoadingIcons reduceMotion />
    </div>
  ))
  .add('reduced Motion 3 up', () => (
    <div style={{ display: 'flex', overflow: 'hidden', height: 150 }}>
      <div style={{ width: 200, height: 150 }}>
        <LoadingIcons initialDelay={0} reduceMotion />
      </div>
      <div style={{ width: 200, height: 150 }}>
        <LoadingIcons initialDelay={100} reduceMotion />
      </div>
      <div style={{ width: 200, height: 150 }}>
        <LoadingIcons initialDelay={200} reduceMotion />
      </div>
    </div>
  ));
