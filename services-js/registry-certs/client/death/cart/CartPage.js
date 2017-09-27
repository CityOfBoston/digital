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
          {cart.entries.map(entry => (
            <CartItem key={entry.id} entry={entry} cart={cart} />
          ))}

          {cart.entries.length === 0 && (
            <div className="p-a300 g">
              <div className="g--9 t--intro vertical-center">
                Your cart has no items.
              </div>
              <div className="g--3 m-v500">
                <Link href="/death/">
                  <a className="btn">Back to Search</a>
                </Link>
              </div>
            </div>
          )}

          {cart.entries.length > 0 && (
            <div className="p-a300 g">
              {this.renderCost()}

              <div className="g--3 m-v500">
                <Link href="/death/payment">
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

    return (
      <div className="m-v500 g--9">
        <div className="t--info">
          {cart.size} {cart.size === 1 ? 'certificate' : 'certificates'} × ${CERTIFICATE_COST}{' '}
          + {(PROCESSING_FEE * 100).toFixed(2)}% credit card fee
        </div>
        <div className="sh sh--b0">
          <span className="sh-title">Subtotal: ${cart.cost.toFixed(2)}</span>
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
