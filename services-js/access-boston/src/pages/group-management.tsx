import React from 'react';
import Head from 'next/head';

// import fetch from 'node-fetch';

// import ApolloClient from 'apollo-boost';
// import { ApolloProvider } from '@apollo/react-hooks';

import { PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import fetchAccount, { Account } from '../client/graphql/fetch-account';

import { GetInitialPropsDependencies, GetInitialProps } from './_app';

import AppWrapper from '../client/common/AppWrapper';
import Index from '../client/group-management/Index';

interface Props {
  account: Account;
}

// const client = new ApolloClient({
//   uri: 'http://localhost:7000/graphql',
//   fetch,
// } as any);

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
          {/*<ApolloProvider client={client as any}>*/}
          <Index groups={account.groups} />
          {/*</ApolloProvider>*/}
        </AppWrapper>
      </>
    );
  }
}
