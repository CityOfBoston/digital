import React from 'react';
import Head from 'next/head';
import { fetchJson } from '@cityofboston/next-client-common';
import {
  SectionHeader,
  PUBLIC_CSS_URL,
  CHARLES_BLUE,
  SANS,
} from '@cityofboston/react-fleet';
import { css } from 'emotion';

import { InfoResponse } from '../lib/api';
import CrumbContext from '../client/CrumbContext';

export interface Props {
  info: InfoResponse;
}

export interface State {
  accountMenuOpen: boolean;
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

const APP_ROW_STYLE = css({
  display: 'inline-block',
  verticalAlign: 'middle',
});

export default class IndexPage extends React.Component<Props> {
  static async getInitialProps({ req }) {
    return { info: await fetchJson(req, '/info') };
  }

  state = {
    accountMenuOpen: false,
  };

  render() {
    const { employeeId, requestAccessUrl, categories } = this.props.info;

    const iconCategories = categories.filter(({ icons }) => icons);
    const listCategories = categories.filter(({ icons }) => !icons);

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
                {iconCategories.map(
                  ({ title, apps, showRequestAccessLink }) => (
                    <div className="m-b500" key={title}>
                      <SectionHeader title={title} />

                      {showRequestAccessLink && (
                        <div className="t--subinfo p-a200 m-v300">
                          Is there an app that you need access to that’s not
                          shown here? Fill out the{' '}
                          <a href={requestAccessUrl}>request access form</a>.
                        </div>
                      )}
                      {this.renderAppIcons(apps)}
                    </div>
                  )
                )}

                <div className="g">
                  {listCategories.map(
                    ({ title, apps, showRequestAccessLink }) => (
                      <div className="m-b500 g--6" key={title}>
                        <SectionHeader title={title} />

                        {showRequestAccessLink && (
                          <div className="t--subinfo p-a200 m-v300">
                            Is there an app that you need access to that’s not
                            shown here? Fill out the{' '}
                            <a href={requestAccessUrl}>request access form</a>.
                          </div>
                        )}
                        {this.renderAppList(apps)}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </CrumbContext.Consumer>
    );
  }

  renderAppList(apps) {
    return (
      <ul className="ul m-v500">
        {apps.map(({ title, url, description }) => (
          <li key={title}>
            <a href={url} className={`p-a300 ${APP_ROW_STYLE}`}>
              <div className="t--info" style={{ color: 'inherit' }}>
                {title}
              </div>
              <div style={{ color: CHARLES_BLUE }}>{description}</div>
            </a>
          </li>
        ))}
      </ul>
    );
  }

  renderAppIcons(apps) {
    return (
      <div className="g">
        {apps.map(({ title, url, iconUrl }) => (
          <a href={url} key={title} className="lwi m-t200 g--3 g--3--sl">
            <span className="lwi-ic">
              <img
                src={iconUrl || 'https://patterns.boston.gov/images/b-dark.svg'}
                alt=""
                className="lwi-i"
              />
            </span>
            <span className="lwi-t">{title}</span>
          </a>
        ))}
      </div>
    );
  }
}
