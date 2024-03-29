import React from 'react';
import Head from 'next/head';

import { PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import fetchAccount, { Account } from '../client/graphql/fetch-account';

import { GetInitialPropsDependencies, GetInitialProps } from './_app';

import AppWrapper from '../client/common/AppWrapper';
import Index from '../client/group-management/Index';

interface Props {
  account: Account;
}

export default class GroupManagement extends React.Component<Props> {
  static getInitialProps: GetInitialProps<Props> = async (
    _ctx,
    { fetchGraphql }: GetInitialPropsDependencies
  ): Promise<Props> => {
    const account = await fetchAccount(fetchGraphql);
    // requireRegistration(account);
    return {
      account,
    };
  };

  render() {
    const { account } = this.props;
    return (
      <>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Access Boston - Group Management</title>
        </Head>

        <AppWrapper account={account}>
          <Index groups={account.groups} />
        </AppWrapper>
      </>
    );
  }
}
