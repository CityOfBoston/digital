// @flow

import React, { type Element as ReactElement } from 'react';
import Head from 'next/head';

import type { DeathCertificate } from '../types';

import {
  getDependencies,
  type ClientContext,
  type ClientDependencies,
} from '../app';

import { wrapAppLayout } from '../AppLayout';

type InitialProps = {|
  id: string,
  certificate: ?DeathCertificate,
|};

type ContentProps = {
  ...InitialProps,
  addToCart: number => mixed,
};

type ContentState = {
  quantity: number,
};

export class CertificatePageContent extends React.Component<
  ContentProps,
  ContentState
> {
  state = {
    quantity: 1,
  };

  handleQuantityChange = (ev: SyntheticInputEvent<*>) => {
    this.setState({
      quantity: parseInt(ev.target.value, 10),
    });
  };

  handleAddToCart = (ev: SyntheticInputEvent<*>) => {
    ev.preventDefault();

    const { addToCart } = this.props;
    const { quantity } = this.state;

    addToCart(quantity);
  };

  render() {
    const { id, certificate } = this.props;

    return (
      <div>
        <Head>
          <title>Boston.gov — Death Certificate #{id}</title>
        </Head>

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
            <span className="dl-d">
              {firstName} {lastName}
            </span>
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
          className="js-add-to-cart-form m-v300"
        >
          <select
            name="quantity"
            value={quantity}
            className="quantity"
            onChange={this.handleQuantityChange}
          >
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

          <button type="submit" className="btn add-to-cart">
            Add to Cart
          </button>
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

export const wrapCertificatePageController = (
  getDependencies: (ctx?: ClientContext) => ClientDependencies,
  renderContent: (ClientDependencies, ContentProps) => ?ReactElement<*>
) =>
  class CertificatePageController extends React.Component<InitialProps> {
    static async getInitialProps(ctx: ClientContext): Promise<InitialProps> {
      const { query: { id } } = ctx;
      const { deathCertificatesDao } = getDependencies(ctx);

      const certificate = await deathCertificatesDao.get(id);

      return {
        id,
        certificate,
      };
    }

    dependencies = getDependencies();

    addToCart = (quantity: number) => {
      const { cart } = this.dependencies;
      const { certificate } = this.props;

      if (certificate) {
        cart.add(certificate, quantity);
      }
    };

    render() {
      const { addToCart } = this;
      const { id, certificate } = this.props;

      return renderContent(this.dependencies, { id, certificate, addToCart });
    }
  };

export default wrapCertificatePageController(
  getDependencies,
  wrapAppLayout('checkout', (_, props) => <CertificatePageContent {...props} />)
);
