import React from 'react';
import Head from 'next/head';
import {
  SectionHeader,
  PUBLIC_CSS_URL,
} from '../../../../modules-js/react-fleet/build/react-fleet';

export interface Props {}

export default class IndexPage extends React.Component<Props> {
  render() {
    return (
      <div className="mn">
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
        </Head>

        <div className="b b-c">
          <SectionHeader title="Access Boston" />
        </div>
      </div>
    );
  }
}
