import React from 'react';
import Head from 'next/head';

import { PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import AppWrapper from '../client/common/AppWrapper';
import Index from '../client/preferred-chosen-name/views/Index';

import fetchAccount, { Account } from '../client/graphql/fetch-account';
import { GetInitialPropsDependencies, GetInitialProps } from './_app';

import { PreferredChosenNameInformation } from '../client/preferred-chosen-name/types';

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
    const { account } = this.props;
    const altWorkflows = ['BPL', 'BPHC'];

    const accountState = new PreferredChosenNameInformation({
      employeeId: account.employeeId || '',
      employeeType: account.cobAgency || '',
      altWorkflow: altWorkflows.includes(account.cobAgency || ''),
      firstName: account.firstName || '',
      lastName: account.lastName || '',
      email: account.email || '',
      chosenFirstName: '',
      chosenLastName: '',
      displayName: account['displayName'] ? account['displayName'] : '',
    });

    return (
      <>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Access Boston - Preferred/Chosen Name</title>
        </Head>

        <AppWrapper>
          <Index accountState={accountState} />
        </AppWrapper>
      </>
    );
  }
}
