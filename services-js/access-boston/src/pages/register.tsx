import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import getConfig from 'next/config';

import { SectionHeader, PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import AccessBostonHeader from '../client/AccessBostonHeader';
import { GetInitialPropsDependencies, GetInitialProps } from './_app';
import fetchAccount, { Account } from '../client/graphql/fetch-account';
import { MAIN_CLASS } from '../client/styles';
import { RedirectError } from '../client/auth-helpers';

interface Props {
  account: Account;
}

export default class RegisterPage extends React.Component<Props> {
  static getInitialProps: GetInitialProps<Props> = async (
    _ctx,
    { fetchGraphql }: GetInitialPropsDependencies
  ): Promise<Props> => {
    const account = await fetchAccount(fetchGraphql);

    if (account.registered) {
      throw new RedirectError('/');
    }

    return {
      account,
    };
  };

  render() {
    const { account } = this.props;

    const { publicRuntimeConfig } = getConfig() || { publicRuntimeConfig: {} };
    const logoutImgSrc = `https://${
      publicRuntimeConfig.PING_HOST
    }/ext/idplogout`;

    return (
      <>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Access Boston: Registration</title>
        </Head>

        <AccessBostonHeader account={account} />

        <div className={MAIN_CLASS}>
          <div className="b b-c b-c--hsm">
            <SectionHeader title="Welcome to Access Boston!" />

            <div className="t--intro m-v500">
              Access Boston is the new place to log into your City of Boston
              employee account.
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="t--info" style={{ paddingRight: '1em' }}>
                Next step:
              </span>{' '}
              {account.needsNewPassword ? (
                <Link href="/change-password">
                  <a className="btn">Set Password</a>
                </Link>
              ) : (
                <Link href="/mfa">
                  <a className="btn">Add MFA Device</a>
                </Link>
              )}
            </div>

            <img src={logoutImgSrc} alt="" width="1" height="1" />
          </div>
        </div>
      </>
    );
  }
}
