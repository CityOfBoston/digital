// @flow

import React from 'react';
import { css } from 'glamor';
import Head from 'next/head';
import type { Context } from 'next';

import fetchDeathCertificates from '../queries/fetch-death-certificates';
import makeLoopbackGraphql from '../loopback-graphql';
import type { DeathCertificate } from '../types';

import type Cart from '../store/Cart';
import Nav from '../common/Nav';

const FORM_STYLE = css({
  display: 'flex',
  alignItems: 'center',
});

const QUANTITY_STYLE = css({
  minWidth: '5em',
});

const ADD_TO_CART_STYLE = css({
  flex: 1,
  marginLeft: '1em',
});

export type InitialProps = {|
  id: string,
  certificate: ?DeathCertificate,
|}

export type Props = {
  /* :: ...InitialProps, */
  cart: Cart,
}

type State = {
  quantity: number,
};

export default class CertificatePage extends React.Component {
  props: Props;
  state: State = {
    quantity: 1,
  }

  static async getInitialProps(ctx: Context<*>): Promise<InitialProps> {
    const { query: { id }, req } = ctx;

    const loopbackGraphql = makeLoopbackGraphql(req);
    const certificate = (await fetchDeathCertificates(loopbackGraphql, [id]))[0];

    return {
      id,
      certificate,
    };
  }

  handleQuantityChange = (ev: SyntheticInputEvent) => {
    this.setState({
      quantity: parseInt(ev.target.value, 10),
    });
  }

  handleAddToCart = (ev: SyntheticInputEvent) => {
    const { cart, certificate } = this.props;
    const { quantity } = this.state;

    ev.preventDefault();

    if (certificate) {
      cart.add(certificate, quantity);
    }
  }

  render() {
    const { id, certificate, cart } = this.props;

    return (
      <div>
        <Head>
          <title>Boston.gov — Death Certificate #{id}</title>
        </Head>

        <Nav cart={cart} link="checkout" />

        <div className="p-a300 b--g">
          <div className="sh sh--b0">
            <h1 className="sh-title" style={{ marginBottom: 0 }}>Deceased Details</h1>
          </div>
        </div>

        <div className="p-a300">
          { certificate && this.renderCertificate(certificate) }
        </div>
      </div>
    );
  }

  renderCertificate({ firstName, lastName, birthYear, deathYear, causeOfDeath }: DeathCertificate) {
    const { quantity } = this.state;

    return (
      <div>
        <ul className="dl">
          <li className="dl-i">
            <span className="dl-t">Full Name</span>
            <span className="dl-d">{firstName} {lastName}</span>
          </li>
          <li className="dl-i">
            <span className="dl-t">Birth Year</span>
            <span className="dl-d">{birthYear}</span>
          </li>
          <li className="dl-i">
            <span className="dl-t">Death Year</span>
            <span className="dl-d">{deathYear}</span>
          </li>
          <li className="dl-i">
            <span className="dl-t">Cause of Death</span>
            <span className="dl-d">{causeOfDeath || 'Pending'}</span>
          </li>
        </ul>

        <form onSubmit={this.handleAddToCart} className={`js-add-to-cart-form m-v300 ${FORM_STYLE.toString()}`}>
          <select name="quantity" value={quantity} className={QUANTITY_STYLE} onChange={this.handleQuantityChange}>
            <option value="1">Qty: 1</option>
            <option value="2">Qty: 2</option>
            <option value="3">Qty: 3</option>
            <option value="4">Qty: 4</option>
            <option value="5">Qty: 5</option>
            <option value="6">Qty: 6</option>
            <option value="7">Qty: 7</option>
            <option value="8">Qty: 8</option>
            <option value="9">Qty: 9</option>
            <option value="10">Qty: 10</option>
          </select>

          <button type="submit" className={`btn ${ADD_TO_CART_STYLE.toString()}`}>Add to Cart</button>
        </form>
      </div>
    );
  }

}
