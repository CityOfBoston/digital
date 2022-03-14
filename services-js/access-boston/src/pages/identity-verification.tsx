import React from 'react';
import Head from 'next/head';

import { PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import AppWrapper from '../client/common/AppWrapper';
import Index from '../client/identity-verification/views/Index';

export default class IdentityVerification extends React.Component {
  render() {
    return (
      <>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Access Boston - Identity Verification</title>
        </Head>

        <AppWrapper>
          <Index />
        </AppWrapper>
      </>
    );
  }
}
