import React from 'react';
import Head from 'next/head';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import Link from 'next/link';

import { AddRemoveRadioBtn } from '@cityofboston/react-fleet';

import { PageDependencies } from '../../../pages/_app';

import PageLayout from '../../PageLayout';

import { BREADCRUMB_NAV_LINKS } from '../../../lib/breadcrumbs';

import CartItem from './CartItem';
import CostSummary from '../../common/CostSummary';
import { ServiceFeeDisclosure } from '../../common/FeeDisclosures';

import CertifiedMail from '../../models/CertifiedMail';

export type PageDependenciesProps = Pick<
  PageDependencies,
  'deathCertificateCart' | 'certMailProvider' | 'siteAnalytics'
>;

type State = {
  /**
   * This will be null on the server and during the first client render.
   */
  certMail: CertifiedMail | null;
};

interface Props extends PageDependenciesProps {
  certifiedMailForTest?: CertifiedMail;
}

// interface Props extends Props

@observer
class CartPage extends React.Component<Props, State> {
  // state: State = { certMail: this.props.certifiedMailForTest || null };
  state: State = { certMail: this.props.certifiedMailForTest || null };

  // When we leave the cart page, remove everything that's 0-size.
  componentWillUnmount = action(
    'CartPageController componentWillUnmount',
    () => {
      const { deathCertificateCart } = this.props;
      deathCertificateCart.clean();
    }
  );

  async componentDidMount() {
    const { certMailProvider } = this.props;

    // We won’t have an Order until we’re mounted in the browser because it’s
    // dependent on sessionStorage / localStorage data.
    const certMail = await certMailProvider.get();
    await new Promise((resolve: any) => this.setState({ certMail }, resolve));
  }

  render() {
    const { deathCertificateCart, siteAnalytics } = this.props;
    const loading = !!deathCertificateCart.entries.find(({ cert }) => !cert);

    const certMailHandler = () => {
      const { certMail } = this.state;

      if (certMail) {
        certMail.updateCertMail({
          requestCertifiedMail: !certMail.certMailInfo.requestCertifiedMail,
        });
      }
    };

    return (
      <PageLayout
        showNav
        cart={deathCertificateCart}
        breadcrumbNav={BREADCRUMB_NAV_LINKS.death}
      >
        <div className="b-ff">
          <Head>
            <title>Boston.gov — Death Certificate Cart</title>
          </Head>

          <div className="b-ff b-c b-c--nbp">
            {/* Wrapper <div> because a flex container prevents collapsing vertical
        margins. */}
            <div>
              <div className="m-b500">
                <Link href="/death">
                  <a style={{ fontStyle: 'italic' }}>
                    ← Search for another certificate
                  </a>
                </Link>
              </div>

              <div className="sh sh--b0 m-v300">
                <h1 className="sh-title">Cart</h1>
              </div>
            </div>

            <div className="b-ff">
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
                    <div className="t--intro">There’s nothing here yet!</div>
                    <p className="t--info">
                      Search for death certificates and add them to your cart.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label>Need A Tracking Number?</label>

              <AddRemoveRadioBtn
                labels={['Add', 'Remove']}
                name={`CC_AddRemove`}
                id={`checkoutAddRemove`}
                action={
                  this.state.certMail &&
                  this.state.certMail.certMailInfo.requestCertifiedMail === true
                    ? 'remove'
                    : 'add'
                }
                value={
                  this.state.certMail &&
                  this.state.certMail.certMailInfo.requestCertifiedMail === true
                    ? 1
                    : 0
                }
                onClickHandler={certMailHandler}
              />
            </div>

            {deathCertificateCart.entries.length > 0 && (
              <div className="m-t700">
                <CostSummary
                  certificateType="death"
                  certificateQuantity={deathCertificateCart.size}
                  allowServiceFeeTypeChoice
                  serviceFeeType="CREDIT"
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
