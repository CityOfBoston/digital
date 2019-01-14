import React from 'react';
import { storiesOf } from '@storybook/react';

import Notice from '../model/Notice';
import NoticeColumn from '../model/NoticeColumn';

import NoticeDetail from './NoticeDetail';

const NOTICES: Notice[] = require('../../fixtures/notices.json');
const LONG_NOTICE = NOTICES[1];
const CANCELED_NOTICE = NOTICES[17];
const PUBLIC_TESTIMONY_NOTICE = NOTICES[5];

storiesOf('NoticeDetail', module)
  .addDecorator(story => (
    <div style={{ display: 'flex', height: 650 }}>{story()}</div>
  ))
  .add('default', () => (
    <NoticeDetail noticeColumn={new NoticeColumn('A', LONG_NOTICE)} />
  ))
  .add('2nd page', () => (
    <NoticeDetail
      noticeColumn={Object.assign(new NoticeColumn('A', LONG_NOTICE), {
        currentPage: 2,
      })}
    />
  ))
  .add('public testimony', () => (
    <NoticeDetail
      noticeColumn={new NoticeColumn('A', PUBLIC_TESTIMONY_NOTICE)}
    />
  ))
  .add('canceled', () => (
    <NoticeDetail noticeColumn={new NoticeColumn('A', CANCELED_NOTICE)} />
  ))
  .add('loading', () => <NoticeDetail noticeColumn={new NoticeColumn('A')} />);
