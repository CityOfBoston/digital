import React from 'react';
import { PUBLIC_CSS_URL } from '@cityofboston/react-fleet';
import fetchCommissions, {
  Commission,
} from '../../client/graphql/fetch-commissions';
import Head from 'next/head';

export interface Props {
  commissions: Commission[];
}

export default class IndexPage extends React.Component {
  static async getInitialProps(): Promise<Props> {
    const commissions = await fetchCommissions();
    return { commissions };
  }

  render() {
    return (
      <div className="txt m-b300">
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
        </Head>
        <label
          className="txt-l txt-l--sm"
          htmlFor="checkbox-${this.props.name}"
        />
        <input id="B-C" name="B-C" type="checkbox" className="cb-f" />
      </div>
    );
  }
}
