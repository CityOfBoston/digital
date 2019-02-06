import React from 'react';
import { css } from 'emotion';

import {
  CHARLES_BLUE,
  FREEDOM_RED_DARK,
  GRAY_300,
  SANS,
} from '@cityofboston/react-fleet';

import Notice from '../model/Notice';
import NoticeColumn from '../model/NoticeColumn';
import { observer } from 'mobx-react';

type Props = {
  notices: Notice[];
  /** This is passed in so we know how to label the "active" notices. */
  noticeColumns: NoticeColumn[];
};

// Copied from NoticeItem.vue
const NOTICES_LIST_STYLE = css`
  & {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .notice-item {
    margin: 0;
    padding: 0 5%;
    list-style: none;
    font-size: 1.125rem;
    position: relative;
    transition: background 0.4s;
  }

  .notice-canceled {
    text-transform: uppercase;
    color: ${FREEDOM_RED_DARK};
    font-family: ${SANS};
    font-style: normal;
  }

  .notice-item.active {
    background-color: #dedede;
  }

  .notice-column {
    position: absolute;
    height: 33px;
    width: 33px;
    border: 2px solid ${FREEDOM_RED_DARK};
    color: ${FREEDOM_RED_DARK};
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    font-family: ${SANS};
    font-weight: bold;
  }

  .notice-item.active .notice-date,
  .notice-item.active .notice-time,
  .notice-item.active .notice-location {
    color: ${CHARLES_BLUE};
  }

  .notice-item-container {
    padding: 1.125rem 0;
    border-bottom: 1px dashed #d2d2d2;
    display: flex;
    flex-direction: row;
  }

  .notice-info {
    flex: 1;
    padding-right: 1em;
    padding-left: 50px;
  }

  .notice-datetime {
    flex: 0.6;
    text-align: right;
    white-space: nowrap;
    font-style: italic;
  }

  .notice-date,
  .notice-time,
  .notice-location {
    font-size: 14px;
    font-style: italic;
    color: ${GRAY_300};
  }

  .notice-date {
    margin-bottom: 0.25rem;
  }

  .notice-title {
    font-family: ${SANS};
    margin-bottom: 0.25rem;
    font-size: 16px;
  }

  .notice-oneline,
  .notice-oneline a {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 270px;
    display: block;
    text-decoration: none;
  }

  .notice-title a {
    text-decoration: none;
  }
`;

function renderNotice(
  notice: Notice,
  label: string | null
): React.ReactElement<any> {
  return (
    <li key={notice.id} className={`notice-item ${label ? 'active' : ''}`}>
      <div className="notice-item-container">
        {label && (
          <div className="notice-column">
            <span>{label}</span>
          </div>
        )}

        <div className="notice-info">
          <div
            className="notice-title notice-oneline"
            dangerouslySetInnerHTML={{ __html: notice.title }}
          />

          <div className="notice-location">
            {notice.location_street}
            {notice.location_room && <span>, {notice.location_room}</span>}
          </div>
        </div>

        <div className="notice-datetime">
          {notice.canceled === '1' ? (
            <div className="notice-canceled">Canceled</div>
          ) : (
            <>
              <div className="notice-date">{notice.notice_date}</div>
              <div className="notice-time">{notice.notice_time}</div>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

export default observer(function NoticeList({
  notices,
  noticeColumns,
}: Props): React.ReactElement<any> {
  const labelsByNoticeId = {};

  noticeColumns.forEach(({ notice, label }) => {
    if (notice) {
      labelsByNoticeId[notice.id] = label;
    }
  });

  return (
    <ul className={NOTICES_LIST_STYLE}>
      {notices.map(n => renderNotice(n, labelsByNoticeId[n.id]))}
    </ul>
  );
});
