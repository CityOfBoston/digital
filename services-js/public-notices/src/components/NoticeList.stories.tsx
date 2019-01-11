import { storiesOf } from '@storybook/react';

import Notice from '../model/Notice';
import NoticeColumn from '../model/NoticeColumn';

import NoticeList from './NoticeList';

const NOTICES: Notice[] = require('../../fixtures/notices.json');

storiesOf('NoticeList', module).add('default', () => (
  // This width and height match the column when it’s on a 1080p TV.
  <div style={{ width: 576, height: 1080, backgroundColor: 'white' }}>
    <NoticeList
      notices={NOTICES.slice(0, 12).map(
        (n, i) => (i === 3 ? Object.assign({}, n, { canceled: '1' }) : n)
      )}
      noticeColumns={[
        new NoticeColumn('A', NOTICES[1]),
        new NoticeColumn('B', NOTICES[5]),
        new NoticeColumn('C', NOTICES[4]),
      ]}
    />
  </div>
));
