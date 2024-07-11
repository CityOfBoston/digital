import React from 'react';
// import React, {useState, useRef, useEffect } from 'react';
import Head from 'next/head';

import { SectionHeader, PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import AppWrapper from '../client/common/AppWrapper';

interface Props {}
interface State {
  acctFetched: boolean;
}

export default class DonePage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { acctFetched: false };
  }

  async componentDidMount() {
    // TODO: DIG-4670: (BUG) Registration Workflow
    // THIS IS PACK TO THIS BUG, PROPER FIX NEEDS TO HAPPEN ON
    // THE SECURITY TEAMS Servers ...
    // Error = User CRUD update is slow to be available on the endpoint (api)
    const delay = async (ms: number) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    };

    await delay(13000);
    this.setState({ acctFetched: true });
  }

  render() {
    const { acctFetched } = this.state;

    const headerTxt = acctFetched ? 'You’re all set!' : 'Just a moment!';
    const loginTxt = acctFetched
      ? `Log in now to
              continue.`
      : `You can use the button below to Log in a moment.`;

    return (
      <>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Access Boston: Registration</title>
        </Head>

        <AppWrapper>
          <div className="b b-c b-c--hsm">
            <SectionHeader title={headerTxt} />

            <div className="t--intro m-v500">
              You’re now set up with your Access Boston account. {loginTxt}
            </div>

            <div className="ta-r">
              {acctFetched ? (
                <a href="/" className="btn">
                  Log In
                </a>
              ) : (
                <button className={`btn`} aria-disabled disabled>
                  Log In
                </button>
              )}
            </div>
          </div>
        </AppWrapper>
      </>
    );
  }
}
