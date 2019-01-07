import { storiesOf } from '@storybook/react';

import Notice from '../model/Notice';
import NoticeColumn from '../model/NoticeColumn';

import NoticeList from './NoticeList';

const NOTICES: Notice[] = require('../../fixtures/notices.json');

storiesOf('NoticeList', module).add('default', () => (
  <div style={{ width: 450, backgroundColor: 'white' }}>
    <NoticeList
      notices={NOTICES}
      noticeColumns={[
        new NoticeColumn('A', NOTICES[1]),
        new NoticeColumn('B', NOTICES[5]),
        new NoticeColumn('C', NOTICES[4]),
      ]}
    />
  </div>
));
