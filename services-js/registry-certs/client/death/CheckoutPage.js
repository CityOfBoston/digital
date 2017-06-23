// @flow

import React from 'react';
import Head from 'next/head';
import { observer } from 'mobx-react';
import Link from 'next/link';

import { CERTIFICATE_COST, PROCESSING_FEE } from '../store/Cart';
import type Cart from '../store/Cart';
import Nav from '../common/Nav';
import CheckoutItem from './checkout/CheckoutItem';

export type InitialProps = {||};

export type Props = {
  /* :: ...InitialProps, */
  cart: Cart,
};

@observer
export default class CheckoutPage extends React.Component {
  props: Props;

  render() {
    const { cart } = this.props;

    return (
      <div>
        <Head>
          <title>Boston.gov — Death Certificate Checkout</title>
        </Head>

        <Nav cart={cart} link="lookup" />

        <div className="p-a300">
          <div className="sh sh--b0 m-v300">
            <h1 className="sh-title">Checkout</h1>
          </div>
        </div>

        <div>
          {cart.items.map(item =>
            <CheckoutItem key={item.id} item={item} cart={cart} />,
          )}

          <div className="p-a300 g">
            {this.renderCost()}

            <Link href="/death/payment">
              <a className="btn g--3 m-v500">Pay and Finish</a>
            </Link>

            <style jsx>{`
              a.btn {
                align-self: center;
                text-align: center;
              }
            `}</style>

          </div>
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
