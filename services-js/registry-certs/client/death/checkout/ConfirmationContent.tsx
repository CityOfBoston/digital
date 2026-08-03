/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { observer } from 'mobx-react';

import {
  CHARLES_BLUE,
  GRAY_400,
  OPTIMISTIC_BLUE_DARK,
  SANS,
  SERIF,
  WHITE,
} from '@cityofboston/react-fleet';

import PageLayout from '../../PageLayout';
import { BREADCRUMB_NAV_LINKS } from '../../../lib/breadcrumbs';

import Cart from '../../store/DeathCertificateCart';

import { CONFIRM_SVG } from '../../common/components';

export interface Props {
  orderId: string;
  contactEmail: string;
  cart: Cart;
}

/**
 * Death order confirmation — Figma CONFIRMATION.
 * Order id comes from props; padding matches the frame (banner 24×32, body 24).
 */
@observer
export default class ConfirmationContent extends React.Component<Props> {
  render() {
    const { orderId, cart } = this.props;

    return (
      <PageLayout
        showNav
        cart={cart}
        breadcrumbNav={BREADCRUMB_NAV_LINKS.death}
      >
        <div className="b-c" css={PAGE_STYLING}>
          <Head>
            <title>Boston.gov - Death Certificate Order Complete</title>
          </Head>

          <div css={BANNER_STYLING} role="status">
            <CONFIRM_SVG />
            <div css={BANNER_COPY_STYLING}>
              <p css={BANNER_TITLE_STYLING}>Your request has been received</p>
              <p css={BANNER_ORDER_STYLING}>
                <span css={BANNER_ORDER_LABEL_STYLING}>Order number: </span>#
                {orderId}
              </p>
              <p css={BANNER_EMAIL_STYLING}>
                A confirmation has been sent to your email.
              </p>
            </div>
          </div>

          <div css={BODY_STYLING}>
            <h2 css={NEXT_TITLE_STYLING}>What happens next?</h2>

            <ul css={NEXT_LIST_STYLING}>
              <li>The Registry will review your order.</li>
              <li>
                If you requested the decedent’s SSN, we’ll review your supporting
                documentation and contact you if additional information is
                needed.
              </li>
              <li>Your card won’t be charged until your order is approved.</li>
              <li>
                Once approved, your order will be processed within 2–3 business
                days and mailed to your shipping address.
              </li>
            </ul>

            <p css={QUESTIONS_STYLING}>
              <strong>Questions?</strong> Email the Registry Department at{' '}
              <a href="mailto:death@boston.gov">death@boston.gov</a>.
            </p>

            <p css={ORDER_LINKS_STYLING}>
              Order a new <Link href="/birth">birth</Link>,{' '}
              <Link href="/marriage">marriage</Link>, or{' '}
              <Link href="/death">death</Link> certificate.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }
}

const PAGE_STYLING = css({
  maxWidth: '45rem',
});

// Figma banner: padding 24/32/24/32, gap 20 between icon and copy
const BANNER_STYLING = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '20px',
  boxSizing: 'border-box',
  width: '100%',
  padding: '24px 32px',
  marginBottom: '12px',
  borderRadius: '4px',
  backgroundColor: '#e3f5e1',
  color: CHARLES_BLUE,

  // CONFIRM_SVG wraps the icon; neutralize its extra right margin
  '> div': {
    flexShrink: 0,
    margin: 0,

    svg: {
      display: 'block',
      width: 40,
      height: 40,
      margin: 0,
    },
  },
});

const BANNER_COPY_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  flex: 1,
  minWidth: 0,
});

const BANNER_TITLE_STYLING = css({
  margin: 0,
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1.25rem',
  lineHeight: 1.2,
  textTransform: 'uppercase',
  color: CHARLES_BLUE,
});

const BANNER_ORDER_STYLING = css({
  margin: 0,
  fontFamily: SERIF,
  fontWeight: 400,
  fontSize: '1.25rem',
  lineHeight: 1.3,
  color: CHARLES_BLUE,
});

const BANNER_ORDER_LABEL_STYLING = css({
  fontWeight: 700,
});

const BANNER_EMAIL_STYLING = css({
  margin: 0,
  fontFamily: SERIF,
  fontWeight: 700,
  fontSize: '1.25rem',
  lineHeight: 1.3,
  color: CHARLES_BLUE,
});

// Figma body: padding 24 all sides
const BODY_STYLING = css({
  boxSizing: 'border-box',
  width: '100%',
  padding: '24px',
  border: `1px solid ${GRAY_400}`,
  backgroundColor: WHITE,
  color: CHARLES_BLUE,
});

const NEXT_TITLE_STYLING = css({
  margin: '0 0 1rem',
  fontFamily: SERIF,
  fontWeight: 700,
  fontSize: '1.125rem',
  lineHeight: 1.3,
  color: CHARLES_BLUE,
});

const NEXT_LIST_STYLING = css({
  margin: '0 0 1.25rem',
  paddingLeft: '1.5rem',
  listStyleType: 'disc',
  listStylePosition: 'outside',
  color: CHARLES_BLUE,
  fontFamily: SERIF,
  fontSize: '1.125rem',
  lineHeight: 1.45,

  li: {
    display: 'list-item',
    listStyleType: 'disc',
    marginBottom: '0.75rem',
    paddingLeft: '0.25rem',

    '&:last-of-type': {
      marginBottom: 0,
    },
  },
});

const QUESTIONS_STYLING = css({
  margin: '0 0 1.25rem',
  fontFamily: SERIF,
  fontSize: '1.125rem',
  lineHeight: 1.4,
  color: CHARLES_BLUE,

  a: {
    color: OPTIMISTIC_BLUE_DARK,
    textDecoration: 'underline',

    '&:hover, &:focus': {
      textDecoration: 'none',
    },
  },
});

const ORDER_LINKS_STYLING = css({
  margin: 0,
  fontFamily: SERIF,
  fontSize: '1.125rem',
  lineHeight: 1.4,
  color: CHARLES_BLUE,

  a: {
    color: OPTIMISTIC_BLUE_DARK,
    textDecoration: 'underline',

    '&:hover, &:focus': {
      textDecoration: 'none',
    },
  },
});
