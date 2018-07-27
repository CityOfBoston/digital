import React from 'react';
import Head from 'next/head';
import { fetchJson } from '@cityofboston/next-client-common';
import {
  SectionHeader,
  PUBLIC_CSS_URL,
  CHARLES_BLUE,
  SANS,
  GRAY_000,
} from '@cityofboston/react-fleet';
import { css } from 'emotion';

import { InfoResponse } from '../lib/api';
import CrumbContext from '../client/CrumbContext';

export interface Props {
  info: InfoResponse;
}

const HEADER_STYLE = css({
  display: 'flex',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: CHARLES_BLUE,
  color: 'white',
  zIndex: 2,
});

const HEADER_RIGHT_STYLE = css({
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
});

const ACCESS_BOSTON_TITLE_STYLE = css({
  fontFamily: SANS,
  textTransform: 'uppercase',
  fontSize: '1.25rem',
  fontWeight: 'bold',
});

const SIDEBAR_HEADER_STYLE = css({
  fontFamily: SANS,
  color: CHARLES_BLUE,
  textTransform: 'uppercase',
});

const APP_ROW_STYLE = css({
  display: 'inline-block',
  verticalAlign: 'middle',
});

export default class IndexPage extends React.Component<Props> {
  static async getInitialProps({ req }) {
    return { info: await fetchJson(req, '/info') };
  }

  render() {
    const {
      employeeId,
      accountTools,
      requestAccessUrl,
      categories,
    } = this.props.info;

    return (
      <CrumbContext.Consumer>
        {crumb => (
          <>
            <Head>
              <link rel="stylesheet" href={PUBLIC_CSS_URL} />
              <title>Access Boston</title>
            </Head>

            <div className={`${HEADER_STYLE} p-a200`}>
              <h1 className={`${ACCESS_BOSTON_TITLE_STYLE}`}>Access Boston</h1>
              <div className={`${HEADER_RIGHT_STYLE}`}>
                <span style={{ marginRight: '1em' }}>{employeeId}</span>
                <form action="/logout" method="POST">
                  <input type="hidden" name="crumb" value={crumb} />
                  <button className="btn btn--sm btn--100">Logout</button>
                </form>
              </div>
            </div>

            <div className="mn">
              <div className="b b-c">
                <div className="g">
                  <div className="g--8">
                    {categories.map(({ title, apps }) => (
                      <div className="m-b500" key={title}>
                        <SectionHeader title={title} />
                        <ul className="ul">
                          {apps.map(({ title, url, description }) => (
                            <li key={title}>
                              <a
                                href={url}
                                className={`p-a300 ${APP_ROW_STYLE}`}
                              >
                                <div className="t--sans tt-u">{title}</div>
                                <div style={{ color: CHARLES_BLUE }}>
                                  {description}
                                </div>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="g--4">
                    <div
                      className="p-a200"
                      style={{ backgroundColor: GRAY_000 }}
                    >
                      <h2 className={`${SIDEBAR_HEADER_STYLE} m-b200`}>
                        Account Tools
                      </h2>
                      <ul className="ul">
                        {accountTools.map(({ name, url }) => (
                          <li key={name}>
                            <a href={url}>{name}</a>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="t--subinfo p-a200 m-v300">
                      Is there an app that you need access to that’s not shown
                      here? Fill out the{' '}
                      <a href={requestAccessUrl}>request access form</a>.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CrumbContext.Consumer>
    );
  }
}
