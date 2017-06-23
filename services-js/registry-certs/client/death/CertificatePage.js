// @flow

import React from 'react';
import Head from 'next/head';
import type { Context } from 'next';

import type { DeathCertificate } from '../types';
import type { ClientDependencies } from '../page';

import type Cart from '../store/Cart';
import Nav from '../common/Nav';

export type InitialProps = {|
  id: string,
  certificate: ?DeathCertificate,
|};

export type Props = {
  /* :: ...InitialProps, */
  cart: Cart,
};

type State = {
  quantity: number,
};

export default class CertificatePage extends React.Component {
  props: Props;
  state: State = {
    quantity: 1,
  };

  static async getInitialProps(
    ctx: Context<*>,
    { deathCertificatesDao }: ClientDependencies,
  ): Promise<InitialProps> {
    const { query: { id } } = ctx;

    const certificate = await deathCertificatesDao.get(id);

    return {
      id,
      certificate,
    };
  }

  handleQuantityChange = (ev: SyntheticInputEvent) => {
    this.setState({
      quantity: parseInt(ev.target.value, 10),
    });
  };

  handleAddToCart = (ev: SyntheticInputEvent) => {
    const { cart, certificate } = this.props;
    const { quantity } = this.state;

    ev.preventDefault();

    if (certificate) {
      cart.add(certificate, quantity);
    }
  };

  render() {
    const { id, certificate, cart } = this.props;

    return (
      <div>
        <Head>
          <title>Boston.gov — Death Certificate #{id}</title>
        </Head>

        <Nav cart={cart} link="checkout" />

        <div className="p-a300">
          <div className="sh sh--b0">
            <h1 className="sh-title" style={{ marginBottom: 0 }}>
              Deceased Details
            </h1>
          </div>
        </div>

        <div className="p-a300 b--w">
          {certificate && this.renderCertificate(certificate)}
        </div>
      </div>
    );
  }

  renderCertificate({
    firstName,
    lastName,
    age,
    deathDate,
    deathYear,
  }: DeathCertificate) {
    const { quantity } = this.state;

    return (
      <div>
        <ul className="dl">
          <li className="dl-i">
            <span className="dl-t">Full Name</span>
            <span className="dl-d">{firstName} {lastName}</span>
          </li>
          <li className="dl-i">
            <span className="dl-t">Date of Death</span>
            <span className="dl-d">{deathDate || deathYear}</span>
          </li>
          <li className="dl-i">
            <span className="dl-t">Age</span>
            <span className="dl-d">{age}</span>
          </li>
        </ul>

        <form
          onSubmit={this.handleAddToCart}
          className="js-add-to-cart-form m-v300">
          <select
            name="quantity"
            value={quantity}
            className="quantity"
            onChange={this.handleQuantityChange}>
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

          <button type="submit" className="btn add-to-cart">Add to Cart</button>
        </form>

        <style jsx>{`
          form {
            display: flex;
            align-items: center;
          }
          .quantity {
            min-width: 5em;
          }
          .add-to-cart {
            flex: 1;
            margin-left: 1em;
          }
        `}</style>
      </div>
    );
  }
}
