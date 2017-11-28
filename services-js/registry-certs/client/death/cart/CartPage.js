// @flow

import React from 'react';
import Head from 'next/head';
import { observer } from 'mobx-react';
import Link from 'next/link';

import { getDependencies } from '../../app';

import { PERCENTAGE_STRING, FIXED_STRING } from '../../../lib/costs';

import type Cart from '../../store/Cart';

import AppLayout from '../../AppLayout';

import CartItem from './CartItem';
import CostSummary from '../../common/CostSummary';

type Props = {
  cart: Cart,
};

@observer
export class CartPageContent extends React.Component<Props> {
  render() {
    const { cart } = this.props;

    return (
      <div className="page">
        <style jsx>{`
          .page {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          a.btn {
            align-self: center;
            text-align: center;
            display: block;
          }

          .vertical-center {
            align-self: center;
          }
        `}</style>

        <Head>
          <title>Boston.gov — Death Certificate Cart</title>
        </Head>

        <div className="p-a300">
          <div className="sh sh--b0 m-t300">
            <h1 className="sh-title">Cart</h1>
          </div>
        </div>

        <div className="content">
          <div>
            {cart.entries.map((entry, i) => (
              <CartItem
                key={entry.id}
                entry={entry}
                cart={cart}
                lastRow={i === cart.entries.length - 1}
              />
            ))}

            {cart.entries.length === 0 && (
              <div className="p-a300 g" style={{ paddingTop: 0 }}>
                <div className="g--9  vertical-center">
                  <div className="t--intro">There’s nothing here yet!</div>
                  <p className="t--info">
                    Search for death certificates and add them to your cart.
                  </p>
                </div>
                <div className="g--3 m-v500">
                  <Link href="/death/">
                    <a className="btn">Back to Search</a>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {cart.entries.length > 0 && (
            <div className="p-a300">
              <CostSummary cart={cart} />

              <div className="m-v500">
                <Link href="/death/checkout">
                  <a className="btn">Continue to Checkout</a>
                </Link>
              </div>

              <p className="t--subinfo">
                <a name="service-fee" />
                * You are charged an extra service fee of {
                  FIXED_STRING
                } plus {PERCENTAGE_STRING}. This fee goes directly to a third
                party to pay for the cost of credit card processing. Learn more
                about{' '}
                <a href="https://www.boston.gov/">
                  credit card service fees
                </a>{' '}
                at the City of Boston.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default function CartPageContentController() {
  const { cart } = getDependencies();

  return (
    <AppLayout navProps={{ cart, link: 'lookup' }}>
      <CartPageContent cart={cart} />
    </AppLayout>
  );
}
