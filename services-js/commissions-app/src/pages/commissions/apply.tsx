import React from 'react';
import Head from 'next/head';

import { SectionHeader, PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import MyComponent from '../../client/MyComponent';
import fetchCommissions, {
  Commission,
} from '../../client/graphql/fetch-commissions';

export interface Props {
  commissions: Commission[];
}

export default class IndexPage extends React.Component<Props> {
  static async getInitialProps(): Promise<Props> {
    const commissions = await fetchCommissions();
    return { commissions };
  }

  render() {
    const { commissions } = this.props;

    return (
      <div className="mn">
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
        </Head>

        <div className="b b-c">
          <SectionHeader title="Commissions Page Scaffold" />
          <MyComponent />

          <ul>
            {commissions.map(commission => (
              <li key={commission.id}>{commission.name}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}
