import React from 'react';
import Head from 'next/head';

import { SectionHeader, PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import AppWrapper from '../client/common/AppWrapper';

export default class DonePage extends React.Component {
  render() {
    return (
      <>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Access Boston: Registration</title>
        </Head>

        <AppWrapper>
          <div className="b b-c b-c--hsm">
            <SectionHeader title="You’re all set!" />

            <div className="t--intro m-v500">
              You’re now set up with your Access Boston account. Log in now to
              continue.
            </div>

            <div className="ta-r">
              <a href="/" className="btn">
                Log In
              </a>
            </div>
          </div>
        </AppWrapper>
      </>
    );
  }
}
