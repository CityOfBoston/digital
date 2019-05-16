import React from 'react';
import Head from 'next/head';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import Link from 'next/link';

import { PageDependencies } from '../../../pages/_app';

import PageLayout from '../../PageLayout';

import { BREADCRUMB_NAV_LINKS } from '../../../lib/breadcrumbs';

import CartItem from './CartItem';
import CostSummary from '../../common/CostSummary';
import { ServiceFeeDisclosure } from '../../common/FeeDisclosures';

interface Props
  extends Pick<PageDependencies, 'deathCertificateCart' | 'siteAnalytics'> {}

@observer
class CartPage extends React.Component<Props> {
  // When we leave the cart page, remove everything that's 0-size.
  componentWillUnmount = action(
    'CartPageController componentWillUnmount',
    () => {
      const { deathCertificateCart } = this.props;
      deathCertificateCart.clean();
    }
  );

  render() {
    const { deathCertificateCart, siteAnalytics } = this.props;

    const loading = !!deathCertificateCart.entries.find(({ cert }) => !cert);

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
