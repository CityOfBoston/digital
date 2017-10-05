// @flow

import React from 'react';
import Head from 'next/head';
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
            out your order in 1–2 business days by USPS.
          </p>

          <p>
            If you have any questions, you can call the Registry Department at{' '}
            <a href="tel:617-635-4175">617-635-4175</a> or email{' '}
            <a href="mailto:registry@boston.gov">registry@boston.gov</a>.
          </p>
        </div>
      </div>
    );
  }
}
