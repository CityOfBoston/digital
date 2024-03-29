import React from 'react';
import Head from 'next/head';

import { PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import AppWrapper from '../client/common/AppWrapper';
import Index from '../client/confirmid/views/Index';

import fetchAccount, { Account } from '../client/graphql/fetch-account';
import { GetInitialPropsDependencies, GetInitialProps } from './_app';

interface Props {
  account: Account;
}

export default class IdentityVerification extends React.Component<Props> {
  static getInitialProps: GetInitialProps<Props> = async (
    _ctx,
    { fetchGraphql }: GetInitialPropsDependencies
  ): Promise<Props> => {
    const account = await fetchAccount(fetchGraphql);

    return {
      account,
    };
  };

  render() {
    // const { account } = this.props;

    return (
      <>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Access Boston - Identity Verification</title>
        </Head>

        <AppWrapper>
          {/* <Index groups={account.groups} /> */}
          <Index />
        </AppWrapper>
      </>
    );
  }
}
