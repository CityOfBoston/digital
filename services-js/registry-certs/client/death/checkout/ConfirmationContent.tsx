import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { observer } from 'mobx-react';

import PageLayout from '../../PageLayout';
import { BREADCRUMB_NAV_LINKS } from '../../../lib/breadcrumbs';

import Cart from '../../store/DeathCertificateCart';

import {
  CONFIRMATION_BANNER__SUCCESS,
  CONFIRMATION_RECEIPT_SUCCESS,
} from '../../common/components';

export interface Props {
  orderId: string;
  contactEmail: string;
  cart: Cart;
}

@observer
export default class ConfirmationContent extends React.Component<Props> {
  render() {
    const { orderId, contactEmail, cart } = this.props;

    return (
      <PageLayout
        showNav
        cart={cart}
        breadcrumbNav={BREADCRUMB_NAV_LINKS.death}
      >
        <div className="b-c">
          <Head>
            <title>Boston.gov - Death Certificate Order Complete</title>
          </Head>

          <>
            <CONFIRMATION_BANNER__SUCCESS>
              <label>We Received Your Order</label>
              <p>A copy of your receipt has been sent to {contactEmail}.</p>
            </CONFIRMATION_BANNER__SUCCESS>

            <CONFIRMATION_RECEIPT_SUCCESS>
              <p>
                Your order number is <strong>#{orderId}</strong>.
              </p>

              <p>
                We will mail out your order in 1- business days via the U.S.
                Postal Service.
              </p>

              <p>
                If you paid for <strong>USPS Tracking®</strong> services, a
                Registry Clerk will follow up via email with your shipment's
                tracking number.
              </p>

              <p>
                Have any questions? Email the Registry Department at{' '}
                <Link href="mailto:death@boston.gov">death@boston.gov</Link>.
              </p>

              <p>
                Order a new <Link href="/birth">birth</Link>,{' '}
                <Link href="/marriage">marriage</Link>, or{' '}
                <Link href="/death">death certificate</Link>.
              </p>

              <a
                className="print"
                href={`/death/receipt?id=${orderId}&contactEmail=${encodeURIComponent(
                  contactEmail
                )}`}
                target="_blank"
              >
                View printable receipt
              </a>
            </CONFIRMATION_RECEIPT_SUCCESS>
          </>
        </div>
      </PageLayout>
    );
  }
}
