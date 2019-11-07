import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import getConfig from 'next/config';

import { SectionHeader, PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import { GetInitialPropsDependencies, GetInitialProps } from './_app';
import fetchAccount, { Account } from '../client/graphql/fetch-account';
import { RedirectError } from '../client/auth-helpers';
import HelpContactInfo from '../client/common/HelpContactInfo';

import AppWrapper from '../client/common/AppWrapper';

interface Props {
  account: Account;
}

export default class RegisterPage extends React.Component<Props> {
  static getInitialProps: GetInitialProps<Props> = async (
    _ctx,
    { fetchGraphql }: GetInitialPropsDependencies
  ): Promise<Props> => {
    const account = await fetchAccount(fetchGraphql);

    const canRegister =
      account.needsNewPassword ||
      account.needsMfaDevice ||
      !account.hasMfaDevice;

    if (!canRegister) {
      throw new RedirectError('/');
    }

    return {
      account,
    };
  };

  render() {
    const { account } = this.props;

    const { publicRuntimeConfig: PING_HOST } = getConfig();
    const logoutImgSrc = `https://${PING_HOST}/ext/idplogout`;

    return (
      <>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Access Boston: Registration</title>
        </Head>

        <AppWrapper account={account}>
          <div className="b b-c">
            <SectionHeader title="Welcome to Access Boston!" />

            <div className="g">
              <div className="g--8">
                <div className="t--intro m-v300">
                  Access Boston is the new place to log into your City of Boston
                  employee account.
                </div>

                <p className="t--s400 lh--400">
                  We’ve made a few changes to make things more secure:
                </p>

                <ul className="ul t--s400 lh--400">
                  <li>
                    Passwords need to be a bit longer and a bit stronger. But
                    you only have to change them once a year!
                  </li>

                  <li>
                    We’ll need a mobile phone number or personal email address
                    to send security codes to. You’ll need a security code when
                    you use a new computer or forget your password.
                  </li>
                </ul>

                <p className="t--s400 lh--400">
                  We’ll walk you through everything you need to do to get set
                  up.{' '}
                  {!account.needsNewPassword && (
                    <>
                      Your password is already strong enough, so we just need to
                      set you up for security codes.
                    </>
                  )}
                </p>

                <div style={{ textAlign: 'right' }}>
                  {account.needsNewPassword ? (
                    <Link href="/change-password">
                      <a className="btn">Get Started</a>
                    </Link>
                  ) : (
                    <Link href="/mfa">
                      <a className="btn">Get Started</a>
                    </Link>
                  )}
                </div>
              </div>

              <div className="g--4">
                <div className="txt-l">
                  If you need extra help, give us a call:
                </div>

                <HelpContactInfo />
              </div>
            </div>

            <img src={logoutImgSrc} alt="" width="1" height="1" />
          </div>
        </AppWrapper>
      </>
    );
  }
}
