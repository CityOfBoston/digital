import React from 'react';
import Head from 'next/head';
import { fetchJson } from '@cityofboston/next-client-common';
import { SectionHeader, PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import { InfoResponse } from '../lib/api';

export interface Props {
  info: InfoResponse;
}

export default class IndexPage extends React.Component<Props> {
  static async getInitialProps({ req }) {
    return { info: await fetchJson(req, '/info') };
  }

  render() {
    return (
      <div className="mn">
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
        </Head>

        <div className="b b-c">
          <SectionHeader title="Access Boston" />

          <pre>{JSON.stringify(this.props.info, null, 2)}</pre>
        </div>
      </div>
    );
  }
}
