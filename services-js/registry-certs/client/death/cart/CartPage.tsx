/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import React from 'react';
import Head from 'next/head';
import Router from 'next/router';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import Link from 'next/link';

import {
  CHARLES_BLUE,
  MEDIA_SMALL,
  OPTIMISTIC_BLUE_DARK,
  ProgressBar,
  SANS,
  SERIF,
  WHITE,
} from '@cityofboston/react-fleet';

import { PageDependencies } from '../../../pages/_app';

import PageLayout from '../../PageLayout';

import { BREADCRUMB_NAV_LINKS } from '../../../lib/breadcrumbs';
import { certifiedMailTrackingInUI } from '../../../lib/costs';

import CartItem from './CartItem';
import CostSummary from '../../common/CostSummary';
import { ServiceFeeDisclosure } from '../../common/FeeDisclosures';

import CertifiedMail from '../../models/CertifiedMail';
import CardType, { CARDTYPE } from '../../models/CardType';

import CertMailTracking from '../../common/CertMailTracking';

export type PageDependenciesProps = Pick<
  PageDependencies,
  | 'deathCertificateCart'
  | 'certMailProvider'
  | 'cardTypeProvider'
  | 'siteAnalytics'
>;

type State = {
  /**
   * This will be null on the server and during the first client render.
   */
  certMail: CertifiedMail | null;
  cardType: CardType | null;
  ready: boolean;
};

interface Props extends PageDependenciesProps {
  certifiedMailForTest?: CertifiedMail;
  cardTypeForTest?: CardType;
}

@observer
class CartPage extends React.Component<Props, State> {
  state: State = {
    certMail: this.props.certifiedMailForTest || null,
    cardType: this.props.cardTypeForTest || null,
    ready: false,
  };

  // When we leave the cart page, remove everything that's 0-size.
  componentWillUnmount = action(
    'CartPageController componentWillUnmount',
    () => {
      const { deathCertificateCart } = this.props;
      deathCertificateCart.clean();
    }
  );

  async componentDidMount() {
    const { certMailProvider, cardTypeProvider } = this.props;

    // We won’t have an Order until we’re mounted in the browser because it’s
    // dependent on sessionStorage / localStorage data.
    const certMail = await certMailProvider.get();
    const cardType = await cardTypeProvider.get();

    await new Promise((resolve: any) => {
      this.setState({ certMail, cardType, ready: true }, resolve);
    });
  }

  private handleBack = () => {
    Router.back();
  };

  render() {
    const { deathCertificateCart, siteAnalytics } = this.props;
    const loading = !!deathCertificateCart.entries.find(({ cert }) => !cert);
    const { certMail, cardType, ready } = this.state;

    const certMailHandler = () => {
      const { certMail } = this.state;

      if (certMail) {
        certMail.updateCertMail({
          certMailForDeath: !certMail.certMailInfo.certMailForDeath,
        });
      }
    };

    const cardTypeChangeHandler = (type: CARDTYPE) => {
      const { cardType } = this.state;

      if (cardType) {
        cardType.updateCardType({
          cardType: type,
        });
      }
    };

    let card_type =
      cardType && cardType.cardTypeInfo && cardType.cardTypeInfo.cardType
        ? cardType && cardType.cardTypeInfo.cardType
        : '-1';

    return (
      <PageLayout
        showNav
        cart={deathCertificateCart}
        breadcrumbNav={BREADCRUMB_NAV_LINKS.death}
      >
        <div className="b-ff">
          <Head>
            <title>Boston.gov — Death Certificate Cart</title>
          </Head>

          <div css={PAGE_STYLING} className="b-ff b-c b-c--nbp">
            <h1 css={PAGE_TITLE_STYLING}>Request a death certificate</h1>

            <div css={PROGRESS_WRAP_STYLING}>
              <ProgressBar
                totalSteps={7}
                currentStep={4}
                currentStepCompleted={deathCertificateCart.entries.length > 0}
              />
            </div>

            <h2 css={SECTION_TITLE_STYLING}>Order details</h2>

            <div css={ITEMS_LIST_STYLING}>
              {deathCertificateCart.entries.map((entry, i) => (
                <CartItem
                  key={entry.id}
                  entry={entry}
                  cart={deathCertificateCart}
                  siteAnalytics={siteAnalytics}
                  lastRow={i === deathCertificateCart.entries.length - 1}
                />
              ))}

              {loading && <div className="t--intro">Loading your cart…</div>}
              {deathCertificateCart.entries.length === 0 && (
                <div>
                  <div className="t--intro">There's nothing here yet!</div>
                  <p className="t--info">
                    Search for death certificates and add them to your cart.
                  </p>
                </div>
              )}
            </div>

            {deathCertificateCart.entries.length > 0 && (
              <>
                <CertMailTracking
                  name={`death-workflow--certtracking`}
                  action={
                    certMail && certMail.certMailInfo.certMailForDeath === true
                      ? 'remove'
                      : 'add'
                  }
                  value={
                    certMail && certMail.certMailInfo.certMailForDeath === true
                      ? 1
                      : 0
                  }
                  onClickHandler={certMailHandler}
                />
              </>
            )}

            {!loading && ready && deathCertificateCart.entries.length > 0 && (
              <div css={SUMMARY_BLOCK_STYLING}>
                <CostSummary
                  certificateType="death"
                  certificateQuantity={deathCertificateCart.size}
                  newServiceFeeType={card_type}
                  setCardType={cardTypeChangeHandler}
                  tracking={certifiedMailTrackingInUI(
                    !!(
                      this.state.certMail &&
                      this.state.certMail.certMailInfo.certMailForDeath === true
                    )
                  )}
                />
              </div>
            )}

            <div css={ADD_ANOTHER_WRAP_STYLING}>
              <Link href="/death">
                <a css={ADD_ANOTHER_STYLING}>
                  <img
                    src="/assets/images/death-plus-circle.svg"
                    alt=""
                    width={24}
                    height={24}
                  />
                  Add another certificate
                </a>
              </Link>
            </div>

            {deathCertificateCart.entries.length > 0 && (
              <div css={BUTTON_ROW_STYLING}>
                <button
                  type="button"
                  css={SECONDARY_BUTTON_STYLING}
                  onClick={this.handleBack}
                >
                  Back
                </button>
                <Link
                  href="/death/checkout"
                  prefetch={process.env.NODE_ENV !== 'test'}
                >
                  <a className="btn" css={PRIMARY_BUTTON_STYLING}>
                    Continue to check out
                  </a>
                </Link>
              </div>
            )}
          </div>

          {deathCertificateCart.entries.length > 0 && <ServiceFeeDisclosure />}
        </div>
      </PageLayout>
    );
  }
}

export default (CartPage as any) as React.ComponentClass<Props>;

const PAGE_STYLING = css({
  maxWidth: '45rem',
});

const PAGE_TITLE_STYLING = css({
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '2rem',
  lineHeight: 1.2,
  textTransform: 'uppercase',
  color: CHARLES_BLUE,
  margin: '0 0 1.5rem',
});

const PROGRESS_WRAP_STYLING = css({
  marginBottom: '2rem',
});

const SECTION_TITLE_STYLING = css({
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1.875rem',
  lineHeight: 1.2,
  textTransform: 'uppercase',
  color: CHARLES_BLUE,
  margin: '0 0 1.5rem',
});

const ITEMS_LIST_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginBottom: '1.5rem',
});

const SUMMARY_BLOCK_STYLING = css({
  marginTop: '0.5rem',
  marginBottom: '1.5rem',
});

const ADD_ANOTHER_WRAP_STYLING = css({
  marginBottom: '1.5rem',
});

const ADD_ANOTHER_STYLING = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  boxSizing: 'border-box',
  minHeight: '48px',
  padding: '8px',
  border: '1px solid #d2d2d2',
  backgroundColor: WHITE,
  fontFamily: SERIF,
  fontWeight: 600,
  fontSize: '1.125rem',
  lineHeight: 1.2,
  color: OPTIMISTIC_BLUE_DARK,
  textDecoration: 'none',
  cursor: 'pointer',

  img: {
    display: 'block',
    width: 24,
    height: 24,
    flexShrink: 0,
  },

  '&:hover, &:focus': {
    backgroundColor: '#f3f3f3',
  },
});

const BUTTON_ROW_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginTop: '0.5rem',
  marginBottom: '2rem',

  [MEDIA_SMALL]: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '1.5rem',
  },
});

const SECONDARY_BUTTON_STYLING = css({
  appearance: 'none',
  background: WHITE,
  border: '1px solid #d2d2d2',
  color: OPTIMISTIC_BLUE_DARK,
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'uppercase',
  minHeight: '55px',
  minWidth: '10rem',
  padding: '0.625rem 1rem',
  cursor: 'pointer',

  '&:hover, &:focus': {
    background: '#f3f3f3',
  },
});

const PRIMARY_BUTTON_STYLING = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '55px',
  minWidth: '10rem',
  textTransform: 'uppercase',
  fontWeight: 700,
  textAlign: 'center',
  textDecoration: 'none',
});
