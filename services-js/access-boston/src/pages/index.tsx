/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

// import { css } from 'emotion';

import { differenceInCalendarDays } from 'date-fns';

import {
  SectionHeader,
  PUBLIC_CSS_URL,
  CHARLES_BLUE,
  MEDIA_LARGE_MAX,
} from '@cityofboston/react-fleet';

import fetchAccountAndApps, {
  Account,
  Apps,
  CategoryApps,
} from '../client/graphql/fetch-account-and-apps';
import { GetInitialPropsDependencies, GetInitialProps } from './_app';
import { requireRegistration } from '../client/auth-helpers';

import AppWrapper from '../client/common/AppWrapper';

export enum FlashMessage {
  CHANGE_PASSWORD_SUCCESS = 'password',
}

const FLASH_MESSAGE_STRINGS = {
  [FlashMessage.CHANGE_PASSWORD_SUCCESS]: 'Your password has been changed!',
};

interface Props {
  account: Account;
  apps: Apps;
  flashMessage?: FlashMessage;
  daysUntilMfa: number | null;
}

export default class IndexPage extends React.Component<Props> {
  static getInitialProps: GetInitialProps<Props> = async (
    { query },
    { fetchGraphql }: GetInitialPropsDependencies
  ): Promise<Props> => {
    const { account, apps } = await fetchAccountAndApps(fetchGraphql);

    requireRegistration(account);

    const daysUntilMfa =
      !account.hasMfaDevice && account.mfaRequiredDate
        ? differenceInCalendarDays(account.mfaRequiredDate, new Date())
        : null;

    return {
      flashMessage: query.message as FlashMessage | undefined,
      daysUntilMfa,
      account,
      apps,
    };
  };

  render() {
    const {
      account,
      flashMessage,
      apps: { categories },
      daysUntilMfa,
    } = this.props;
    const iconCategories = categories.filter(({ showIcons }) => showIcons);
    const listCategories = categories.filter(({ showIcons }) => !showIcons);

    return (
      <>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Access Boston</title>
        </Head>

        <AppWrapper account={account}>
          {flashMessage && (
            <div className="b--g">
              <div className="b-c" style={{ padding: 0 }}>
                <div className="t--intro p-v500">
                  {FLASH_MESSAGE_STRINGS[flashMessage]}
                </div>
              </div>
            </div>
          )}

          {daysUntilMfa !== null && daysUntilMfa > 0 && (
            <div className="b--g">
              <div className="b-c" style={{ padding: 0 }}>
                <div className="g g--vc p-v500">
                  <div className="g--9">
                    <div className="h3 tt-u">Account notice</div>
                    <div className="t--intro">
                      You have{' '}
                      <strong>
                        {daysUntilMfa === 1 ? '1 day' : `${daysUntilMfa} days`}
                      </strong>{' '}
                      to complete your registration.
                    </div>
                  </div>

                  <div className="g--3 ta-r">
                    <Link href="/mfa">
                      <a className="btn" style={{ whiteSpace: 'nowrap' }}>
                        Complete it now
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="b b-c">
            {iconCategories.map(({ title, apps, requestAccessUrl }) => (
              <section
                className="m-b500"
                key={title}
                aria-labelledby={SectionHeader.makeId(title)}
              >
                <SectionHeader title={title} />

                {requestAccessUrl && (
                  <div className="t--subinfo p-a200 m-v300">
                    Looking for an app that’s not shown here? Fill out the{' '}
                    <a href={requestAccessUrl}>request access form</a>.
                  </div>
                )}
                {this.renderAppIcons(apps)}
              </section>
            ))}

            <div className="g">
              {listCategories.map(({ title, apps, requestAccessUrl }) => {
                const elems =
                  apps.length > 0 ? (
                    <section
                      className="m-b500 g--6"
                      key={title}
                      aria-labelledby={SectionHeader.makeId(title)}
                    >
                      <SectionHeader title={title} />
                      {requestAccessUrl && (
                        <div className="t--subinfo p-a200 m-v300">
                          Is there an app that you need access to that’s not
                          shown here? Fill out the{' '}
                          <a href={requestAccessUrl}>request access form</a>.
                        </div>
                      )}
                      {this.renderAppList(apps)}
                    </section>
                  ) : (
                    ''
                  );
                return elems;
              })}
            </div>
          </div>
        </AppWrapper>
      </>
    );
  }

  private linkDefaultTarget = url => (url.startsWith('/') ? '_self' : '_blank');

  private renderAppList(apps: CategoryApps) {
    const listItems = apps.map(({ title, url, description, target }) => {
      const hrefTarget =
        target && (target === '_blank' || target === '_self')
          ? this.linkDefaultTarget(target)
          : this.linkDefaultTarget(url);
      return (
        <li key={title} css={APP_ROW_STYLE}>
          <a
            href={url}
            id={`app-link-${title}`}
            className="p-a300"
            target={hrefTarget}
          >
            <span className="t--info" style={{ color: 'inherit' }}>
              {title}
            </span>
            <span style={{ color: CHARLES_BLUE }}>{description}</span>
          </a>
        </li>
      );
    });
    return <ul className="ul m-v500">{listItems}</ul>;
  }

  private renderAppIcons(apps: CategoryApps) {
    const listItems = apps.map(({ title, url, iconUrl, target }) => {
      const hrefTarget =
        target && (target === '_blank' || target === '_self')
          ? this.linkDefaultTarget(target)
          : this.linkDefaultTarget(url);
      return (
        <a
          key={title + url}
          href={url}
          id={`app-icon-${title}`}
          className="m-t200 g--3 g--3--sl lwi"
          target={hrefTarget}
        >
          <span className="lwi-ic">
            <img
              src={iconUrl || 'https://patterns.boston.gov/images/b-dark.svg'}
              alt=""
              className="lwi-i"
              css={APP_IMAGE_STYLE}
            />
          </span>
          <span className="lwi-t">{title}</span>
        </a>
      );
    });
    return <div className="g">{listItems}</div>;
  }
}

const APP_ROW_STYLE = css({
  a: {
    display: 'inline-block',
    verticalAlign: 'middle',
    '&:hover': {
      color: 'currentColor',
    },
  },

  span: {
    display: 'block',
  },
});

const APP_IMAGE_STYLE = css({
  objectFit: 'contain',

  [MEDIA_LARGE_MAX]: {
    maxHeight: 84,
  },
});
