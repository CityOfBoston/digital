import React from 'react';
import Head from 'next/head';

import { SectionHeader, PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import AccessBostonHeader from '../client/AccessBostonHeader';
import { MAIN_CLASS } from '../client/styles';

export default class DonePage extends React.Component {
  render() {
    return (
      <>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Access Boston: Registration</title>
        </Head>

        <AccessBostonHeader />

        <div className={MAIN_CLASS}>
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
        </div>
      </>
    );
  }
}
