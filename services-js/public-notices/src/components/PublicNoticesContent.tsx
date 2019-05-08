import React from 'react';
import { css, injectGlobal } from 'emotion';
import Head from 'next/head';

import {
  CHARLES_BLUE,
  OPTIMISTIC_BLUE_DARK,
  SANS,
  SERIF,
  WHITE,
} from '@cityofboston/react-fleet';

import Notice from '../model/Notice';
import NoticeColumn from '../model/NoticeColumn';
import Timer from '../model/Timer';

import LastUpdated from './LastUpdated';
import NoticeDetail from './NoticeDetail';
import Countdown from './Countdown';
import NoticeList from './NoticeList';

type Props = {
  notices: Notice[];
  noticeColumns: NoticeColumn[];
  lastUpdated: Date | null;
  timer: Timer;
};

// Copied from App.vue
const APP_STYLE = css`
  & {
    flex-direction: row;
    display: flex;
    height: 100vh;
    max-height: 1080px;
    overflow: hidden;
  }

  .header {
    background: ${CHARLES_BLUE};
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 1em;
  }

  h1 {
    margin: 0;
    color: ${WHITE};
    font-family: ${SANS};
    text-transform: uppercase;
  }

  .container {
    display: flex;
    flex-direction: column;
    width: 70%;
  }

  .main {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .columns {
    display: flex;
    flex-direction: row;
    flex: 1;
    overflow: hidden;
  }

  .sidebar {
    width: 30%;
    background-color: ${WHITE};
    padding: 0;
    overflow: hidden;
  }

  .column:not(:first-of-type).sidebar {
    margin-left: 0;
  }
`;

injectGlobal(`
  body,
  html {
    height: 100%;
    background: #ececec;
    margin: 0;
  }

  body {
    font-family: ${SERIF};
    color: ${CHARLES_BLUE};
  }

  a {
    color: ${OPTIMISTIC_BLUE_DARK};
  }
`);

/**
 * Stateless content component to make the public notices page.
 */
export default function PublicNoticesContent({
  notices,
  noticeColumns,
  lastUpdated,
  timer,
}: Props): React.ReactElement<any> {
  return (
    <>
      <Head>
        <title>Public Notices | Boston.gov</title>
      </Head>
      <div className={APP_STYLE}>
        <div className="container">
          <div className="header">
            <h1>City Clerk Postings</h1>
            <LastUpdated lastUpdated={lastUpdated} />
          </div>
          <div className="main">
            <div className="columns">
              {noticeColumns.map(c => (
                <NoticeDetail noticeColumn={c} key={c.label} />
              ))}
            </div>
            <Countdown timer={timer} />
          </div>
        </div>
        <div className="sidebar">
          <NoticeList notices={notices} noticeColumns={noticeColumns} />
        </div>
      </div>
    </>
  );
}
