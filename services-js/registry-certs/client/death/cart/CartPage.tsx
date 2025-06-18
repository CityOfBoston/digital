/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import React from 'react';
import Head from 'next/head';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import Link from 'next/link';

import { SERIF, OPTIMISTIC_BLUE_DARK } from '@cityofboston/react-fleet';

import { PageDependencies } from '../../../pages/_app';

import PageLayout from '../../PageLayout';

import { BREADCRUMB_NAV_LINKS } from '../../../lib/breadcrumbs';

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

// interface Props extends Props

@observer
class CartPage extends React.Component<Props, State> {
  // state: State = { certMail: this.props.certifiedMailForTest || null };
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

          <div css={ORDER_DETAILS} className="b-ff b-c b-c--nbp">
            {/* Wrapper <div> because a flex container prevents collapsing vertical
        margins. */}
            <div>
              <div className="sh sh--b0 m-v300">
                <h1 className="sh-title">Order Details</h1>
              </div>

              <div className="m-b500">
                <Link href="/death">
                  <a>Search for another certificate</a>
                </Link>
              </div>
            </div>

            <div>
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
              <div className="m-t700">
                <CostSummary
                  certificateType="death"
                  certificateQuantity={deathCertificateCart.size}
                  newServiceFeeType={card_type}
                  setCardType={cardTypeChangeHandler}
                  getCardType={deathCertificateCart.getCardType}
                  tracking={
                    this.state.certMail &&
                    this.state.certMail.certMailInfo.certMailForDeath === true
                      ? true
                      : false
                  }
                />

                <div className="g">
                  <div className="g--8" />
                  <div className="ta-r g--4 m-v500">
                    <Link
                      href="/death/checkout"
                      prefetch={process.env.NODE_ENV !== 'test'}
                    >
                      <a className="btn">Go to checkout</a>
                    </Link>
                  </div>
                </div>
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

const ORDER_DETAILS = css`
  .m-b500 a {
    color: ${OPTIMISTIC_BLUE_DARK};
    font-family: ${SERIF};
    font-size: 1.125em;
    text-decoration: underline;
    text-underline-offset: 0.15em;

    &:hover {
      text-decoration: none;
    }
  }
`;
