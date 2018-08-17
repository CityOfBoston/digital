import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

import {
  SectionHeader,
  PUBLIC_CSS_URL,
  CHARLES_BLUE,
} from '@cityofboston/react-fleet';
import { css } from 'emotion';

import AccessBostonHeader from '../client/AccessBostonHeader';
import fetchAccountAndApps, {
  Account,
  Apps,
} from '../client/graphql/fetch-account-and-apps';

interface Props {
  account: Account;
  apps: Apps;
}

const APP_ROW_STYLE = css({
  display: 'inline-block',
  verticalAlign: 'middle',
});

export default class IndexPage extends React.Component<Props> {
  static async getInitialProps({ req }) {
    return {
      ...(await fetchAccountAndApps(req)),
    };
  }

  state = {
    accountMenuOpen: false,
  };

  render() {
    const { categories } = this.props.apps;

    const iconCategories = categories.filter(({ showIcons }) => showIcons);
    const listCategories = categories.filter(({ showIcons }) => !showIcons);

    return (
      <>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Access Boston</title>
        </Head>

        <AccessBostonHeader account={this.props.account} />

        <div className="mn">
          <div className="b b-c">
            {iconCategories.map(({ title, apps, requestAccessUrl }) => (
              <div className="m-b500" key={title}>
                <SectionHeader title={title} />

                {requestAccessUrl && (
                  <div className="t--subinfo p-a200 m-v300">
                    Is there an app that you need access to that’s not shown
                    here? Fill out the{' '}
                    <a href={requestAccessUrl}>request access form</a>.
                  </div>
                )}
                {this.renderAppIcons(apps)}
              </div>
            ))}

            <div className="g">
              {listCategories.map(({ title, apps, requestAccessUrl }) => (
                <div className="m-b500 g--6" key={title}>
                  <SectionHeader title={title} />

                  {requestAccessUrl && (
                    <div className="t--subinfo p-a200 m-v300">
                      Is there an app that you need access to that’s not shown
                      here? Fill out the{' '}
                      <a href={requestAccessUrl}>request access form</a>.
                    </div>
                  )}
                  {this.renderAppList(apps)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
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
          <Link href={url} key={title}>
            <a className="lwi m-t200 g--3 g--3--sl">
              <span className="lwi-ic">
                <img
                  src={
                    iconUrl || 'https://patterns.boston.gov/images/b-dark.svg'
                  }
                  alt=""
                  className="lwi-i"
                />
              </span>
              <span className="lwi-t">{title}</span>
            </a>
          </Link>
        ))}
      </div>
    );
  }
}
