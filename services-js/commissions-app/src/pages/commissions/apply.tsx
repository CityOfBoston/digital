import React from 'react';
import Head from 'next/head';

import { SectionHeader, PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import MyComponent from '../../client/MyComponent';

export default class IndexPage extends React.Component {
  render() {
    return (
      <div className="mn">
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
        </Head>

        <div className="b b-c">
          <SectionHeader title="Commissions Page Scaffold" />
          <MyComponent />
        </div>
      </div>
    );
  }
}
