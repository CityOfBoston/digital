// @flow

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { observer } from 'mobx-react';

export type Props = {
  orderId: string,
  contactEmail: string,
};

@observer
export default class ConfirmationContent extends React.Component<Props> {
  render() {
    const { orderId, contactEmail } = this.props;

    return (
      <div>
        <Head>
          <title>Boston.gov — Death Certificate Order Complete</title>
        </Head>

        <div className="p-a300">
          <div className="sh sh--b0">
            <h1 className="sh-title">Order submitted</h1>
          </div>
        </div>

        <div className="p-a300">
          <div className="t--intro">
            Thank you for your order! Your order number is{' '}
            <strong>#{orderId}</strong>.
          </div>

          <p>
            A copy of your receipt has been sent to {contactEmail}. We will mail
            your order out in 1–2 business days by USPS.
          </p>
        </div>

        <div className="g p-a300 b--w">
          <Link href="/death">
            <a className="g--3 btn m-v500 ta-c">Back to Search</a>
          </Link>
        </div>
      </div>
    );
  }
}
