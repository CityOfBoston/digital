import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { observer } from 'mobx-react';

import AppLayout from '../../AppLayout';

export interface Props {
  orderId: string;
  contactEmail: string;
}

@observer
export default class ConfirmationContent extends React.Component<Props> {
  render() {
    const { orderId, contactEmail } = this.props;

    return (
      <AppLayout showNav>
        <div className="b-c">
          <Head>
            <title>Boston.gov — Death Certificate Order Complete</title>
          </Head>

          <div className="sh sh--b0">
            <h1 className="sh-title">Order submitted</h1>
          </div>

          <div className="t--intro">
            Thank you for your order! Your order number is{' '}
            <strong>#{orderId}</strong>.
          </div>

          <div className="ta-c m-v300">
            <a
              className="btn"
              href={`/death/receipt?id=${orderId}&contactEmail=${encodeURIComponent(
                contactEmail
              )}`}
              target="_blank"
            >
              View printable receipt
            </a>
          </div>

          <p className="t--info" style={{ fontStyle: 'normal' }}>
            A copy of your receipt has been sent to{' '}
            <strong>{contactEmail}</strong>. We will mail out your order in 1–2
            business days via the U.S. Postal Service.
          </p>

          <p className="t--info" style={{ fontStyle: 'normal' }}>
            Have any questions? Contact the Registry on weekdays from 9 a.m. – 4
            p.m. at <a href="tel:617-635-4175">617-635-4175</a>, or email{' '}
            <a href="mailto:registry@boston.gov">registry@boston.gov</a>.
          </p>

          <div className="m-t500 ta-c t--info">
            <Link href="/death">
              <a>Back to search</a>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }
}
