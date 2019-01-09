import React from 'react';
import { storiesOf } from '@storybook/react';

import Notice from '../model/Notice';
import Timer from '../model/Timer';

import PublicNoticesContent from './PublicNoticesContent';
import NoticeColumn from '../model/NoticeColumn';

const NOTICES: Notice[] = require('../../fixtures/notices.json');
const FAKE_TIMER: Required<Timer> = {
  running: true,
  secondsLeft: 30,
  start() {},
  stop() {},
};

storiesOf('PublicNoticesContent', module).add('default', () => (
  <PublicNoticesContent
    notices={NOTICES}
    noticeColumns={[
      new NoticeColumn('A', NOTICES[1]),
      new NoticeColumn('B', NOTICES[3]),
      new NoticeColumn('C', NOTICES[4]),
    ]}
    timer={FAKE_TIMER as any}
    lastUpdated={new Date('2019-01-07T18:56:22.431Z')}
  />
));
