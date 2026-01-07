import React from 'react';
import Head from 'next/head';

import { PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import fetchAccount, { Account } from '../client/graphql/fetch-account';

import { GetInitialPropsDependencies, GetInitialProps, PageDependencies } from './_app';

import AppWrapper from '../client/common/AppWrapper';
import ViewUserInfoIndex from '../client/view-user-info/Index';

interface InitialProps {
  account: Account;
}

interface Props extends InitialProps, Pick<PageDependencies, 'fetchGraphql'> {}

export default class ViewUserInfo extends React.Component<Props> {
  static getInitialProps: GetInitialProps<InitialProps> = async (
    _ctx,
    { fetchGraphql }: GetInitialPropsDependencies
  ): Promise<InitialProps> => {
    const account = await fetchAccount(fetchGraphql);
    return {
      account,
    };
  };

  render() {
    const { account, fetchGraphql } = this.props;
    return (
      <>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Access Boston: View User Information</title>
        </Head>

        <AppWrapper account={account}>
          <ViewUserInfoIndex fetchGraphql={fetchGraphql} />
        </AppWrapper>
      </>
    );
  }
}

