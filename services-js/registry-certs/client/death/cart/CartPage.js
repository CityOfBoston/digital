// @flow

import React from 'react';
import Head from 'next/head';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import Link from 'next/link';

import { getDependencies } from '../../app';

import { PERCENTAGE_CC_STRING, FIXED_CC_STRING } from '../../../lib/costs';

import type Cart from '../../store/Cart';
import type SiteAnalytics from '../../lib/SiteAnalytics';

import AppLayout from '../../AppLayout';

import CartItem from './CartItem';
import CostSummary from '../../common/CostSummary';

type DefaultProps = {|
  cart: Cart,
  siteAnalytics: SiteAnalytics,
|};

type Props = {|
  ...DefaultProps,
|};

@observer
export default class CartPage extends React.Component<Props> {
  static get defaultProps(): DefaultProps {
    const { cart, siteAnalytics } = getDependencies();
    return { cart, siteAnalytics };
  }

  // When we leave the cart page, remove everything that's 0-size.
  componentWillUnmount = action(
    'CartPageController componentWillUnmount',
    () => {
      const { cart } = this.props;
      cart.clean();
    }
  );

  render() {
    const { cart, siteAnalytics } = this.props;

    const loading = !!cart.entries.find(({ cert }) => !cert);

    return (
      <AppLayout showNav>
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
                {cart.entries.map((entry, i) => (
                  <CartItem
                    key={entry.id}
                    entry={entry}
                    cart={cart}
                    siteAnalytics={siteAnalytics}
                    lastRow={i === cart.entries.length - 1}
                  />
                ))}

                {loading && <div className="t--intro">Loading your cart…</div>}
                {cart.entries.length === 0 && (
                  <div>
                    <div className="t--intro">There’s nothing here yet!</div>
                    <p className="t--info">
                      Search for death certificates and add them to your cart.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {cart.entries.length > 0 && (
              <div className="m-t700">
                <CostSummary
                  cart={cart}
                  allowServiceFeeTypeChoice
                  serviceFeeType="CREDIT"
                />

                <div className="g">
                  <div className="g--8" />
                  <div className="ta-c ta-r--large g--4 m-v500">
                    <Link href="/death/checkout">
                      <a className="btn ta-c" style={{ display: 'block' }}>
                        Go to checkout
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {cart.entries.length > 0 && (
            <div className="b--g m-t700">
              <div className="b-c b-c--smv t--subinfo">
                <a name="service-fee" />
                * You are charged an extra service fee of no more than{' '}
                {FIXED_CC_STRING} plus {PERCENTAGE_CC_STRING}. This fee goes
                directly to a third party to pay for the cost of card
                processing. Learn more about{' '}
                <a href="https://www.boston.gov/">card service fees</a> at the
                City of Boston.
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    );
  }
}
