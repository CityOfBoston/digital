// @flow

import React from 'react';
import Head from 'next/head';
import { observer } from 'mobx-react';
import Link from 'next/link';

import { getDependencies } from '../../app';

import { CERTIFICATE_COST, PROCESSING_FEE } from '../../store/Cart';
import type Cart from '../../store/Cart';

import AppLayout from '../../AppLayout';

import CartItem from './CartItem';

type Props = {
  cart: Cart,
};

@observer
export class CartPageContent extends React.Component<Props> {
  render() {
    const { cart } = this.props;

    return (
      <div>
        <style jsx>{`
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

          {cart.entries.length > 0 && (
            <div className="p-a300">
              {this.renderCost()}

              <div className="m-v500">
                <Link href="/death/checkout">
                  <a className="btn">Continue to Checkout</a>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  renderCost() {
    const { cart } = this.props;

    const certificateCost = cart.size * CERTIFICATE_COST;
    const processingFee = PROCESSING_FEE * certificateCost;

    return (
      <div className="m-v500">
        <div className="p-v200">
          <div className="cost-row">
            <span className="t--info">
              {cart.size} {cart.size === 1 ? 'certificate' : 'certificates'} × ${CERTIFICATE_COST}
            </span>
            <span className="cost">${certificateCost.toFixed(2)}</span>
          </div>

          <div className="cost-row">
            <span className="t--info">Credit card processing fee</span>
            <span className="cost">${processingFee.toFixed(2)}</span>
          </div>

          <div className="cost-row">
            <span className="t--info">Shipping with USPS</span>
            <span className="cost">
              <i>free</i>
            </span>
          </div>
        </div>

        <div className="cost-row">
          <span className="sh-title">Total</span>
          <span className="cost br br-t100 p-v200">
            ${cart.cost.toFixed(2)}
          </span>
        </div>

        <style jsx>{`
          .cost-row {
            text-align: right;
          }

          .cost {
            min-width: 5em;
            margin-left: 1em;
            display: inline-block;
          }

          .sh-title {
            padding: 0;
            line-height: 1;
          }
        `}</style>
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
