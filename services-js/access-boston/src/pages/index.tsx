/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Markdown from 'markdown-to-jsx';

import { differenceInCalendarDays } from 'date-fns';
import { NoticeBanner } from './notice';

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

import { Notice } from '../server/graphql/schema';

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
  notice: Notice;
  bannerType?: 'warn' | 'info' | 'error' | 'success' | undefined;
}

export default class IndexPage extends React.Component<Props> {
  static getInitialProps: GetInitialProps<Props> = async (
    { query },
    { fetchGraphql }: GetInitialPropsDependencies
  ): Promise<Props> => {
    const { account, apps, notice } = await fetchAccountAndApps(fetchGraphql);

    requireRegistration(account);

    const daysUntilMfa =
      !account.hasMfaDevice && account.mfaRequiredDate
        ? differenceInCalendarDays(account.mfaRequiredDate, new Date())
        : null;

    return {
      flashMessage: query.message as FlashMessage | undefined,
      daysUntilMfa: query.daysUntilMFA
        ? ((query.daysUntilMFA as unknown) as number | null)
        : daysUntilMfa,
      account,
      apps,
      notice,
      bannerType: query.type as
        | 'warn'
        | 'info'
        | 'error'
        | 'success'
        | undefined,
    };
  };

  render() {
    const {
      account,
      flashMessage,
      apps: { categories },
      daysUntilMfa,
      notice,
      bannerType,
    } = this.props;
    const iconCategories = categories.filter(({ showIcons }) => showIcons);
    const listCategories = categories.filter(({ showIcons }) => !showIcons);

    const canUseBannerType =
      typeof bannerType === 'string' &&
      ['info', 'warn', 'success', 'error'].includes(bannerType);
    const noticeType = canUseBannerType
      ? bannerType
      : notice.type
      ? notice.type
      : `warn`;

    return (
      <>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Access Boston</title>
        </Head>

        <AppWrapper account={account}>
          {notice && notice.text && (
            <NoticeBanner type={noticeType}>
              <label>{notice.label}</label>
              <p>{<Markdown>{notice.text}</Markdown>}</p>
            </NoticeBanner>
          )}

          {flashMessage && (
            <NoticeBanner type={`success`}>
              <div className="flassMessage">
                {FLASH_MESSAGE_STRINGS[flashMessage]}
              </div>
            </NoticeBanner>
          )}

          {daysUntilMfa !== null && daysUntilMfa > 0 && (
            <NoticeBanner type={`warn`} classString={`daysUntilMfa`}>
              <label>Account Notice</label>
              <div className="banner__copy-mfa-reg">
                You have{' '}
                <strong>
                  {daysUntilMfa === 1 ? '1 day' : `${daysUntilMfa} days`}
                </strong>{' '}
                to complete your registration.
                <div className="banner__copy_link-row">
                  <Link href="/mfa">
                    <a href="/mfa">Complete it now</a>
                  </Link>
                </div>
              </div>
            </NoticeBanner>
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
