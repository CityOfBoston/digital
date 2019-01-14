import React from 'react';
import { storiesOf } from '@storybook/react';

import Countdown from './Countdown';
import Timer from '../model/Timer';

const FAKE_TIMER: Required<Timer> = {
  running: true,
  secondsLeft: 30,
  start() {},
  stop() {},
};

storiesOf('Countdown', module).add('default', () => (
  <Countdown timer={FAKE_TIMER as any} />
));
