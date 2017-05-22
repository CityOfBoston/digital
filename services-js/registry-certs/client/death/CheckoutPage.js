// @flow

import React from 'react';
import Head from 'next/head';
import { observer } from 'mobx-react';

import type Cart from '../store/Cart';
import Nav from '../common/Nav';
import CheckoutItem from './checkout/CheckoutItem';

export type InitialProps = {|
|}

export type Props = {
  /* :: ...InitialProps, */
  cart: Cart,
}

@observer
export default class CheckoutPage extends React.Component {
  props: Props;

  handleSubmit = (ev: SyntheticInputEvent) => {
    ev.preventDefault();
  }

  render() {
    const { cart } = this.props;

    return (
      <div>
        <Head>
          <title>Boston.gov — Death Certificate Checkout</title>
        </Head>

        <Nav cart={cart} link="lookup" />

        <div className="p-a300 b--g">
          <div className="sh sh--b0 m-v300">
            <h1 className="sh-title">Checkout</h1>
          </div>
        </div>

        <form className="" acceptCharset="UTF-8" method="get" action="/death" onSubmit={this.handleSubmit}>
          { cart.items.map((item) => <CheckoutItem key={item.id} item={item} cart={cart} />) }

          <div className="p-a300 b--g">
            <button className="btn" type="submit">Pay and Finish</button>
          </div>
        </form>
      </div>
    );
  }
}
