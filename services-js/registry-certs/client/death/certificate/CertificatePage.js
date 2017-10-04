// @flow

import React, { type Element as ReactElement } from 'react';
import Head from 'next/head';
import Link from 'next/link';

import type { DeathCertificate } from '../../types';

import {
  getDependencies,
  type ClientContext,
  type ClientDependencies,
} from '../../app';

import AppLayout from '../../AppLayout';

import AddedToCartPopup from './AddedToCartPopup';

type InitialProps = {|
  id: string,
  certificate: ?DeathCertificate,
  backUrl: ?string,
|};

export type ContentProps = {
  ...InitialProps,
  addToCart: number => mixed,
  showAddedToCart: boolean,
  addedToCartQuantity: number,
  closeAddedToCart: () => mixed,
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
    const {
      id,
      certificate,
      backUrl,
      showAddedToCart,
      addedToCartQuantity,
      closeAddedToCart,
    } = this.props;

    return (
      <div>
        <Head>
          <title>Boston.gov — Death Certificate #{id}</title>
        </Head>

        {backUrl && (
          <div className="m-t300 p-a300">
            <Link href={backUrl}>
              <a style={{ fontStyle: 'italic' }}>← Back to search</a>
            </Link>
          </div>
        )}

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

        {showAddedToCart &&
          certificate && (
            <div className="md">
              <AddedToCartPopup
                certificate={certificate}
                quantity={addedToCartQuantity}
                close={closeAddedToCart}
              />
            </div>
          )}
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
            <span className="dl-t">Date of Birth / Age</span>
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

type ControllerState = {|
  showAddedToCart: boolean,
  addedToCartQuantity: number,
|};

export const wrapCertificatePageController = (
  getDependencies: (ctx?: ClientContext) => ClientDependencies,
  renderContent: (ClientDependencies, ContentProps) => ?ReactElement<*>
) =>
  class CertificatePageController extends React.Component<
    InitialProps,
    ControllerState
  > {
    static async getInitialProps(ctx: ClientContext): Promise<InitialProps> {
      const { query: { id, backUrl } } = ctx;
      const { deathCertificatesDao } = getDependencies(ctx);

      if (!id) {
        throw new Error('Missing id');
      }

      const certificate = await deathCertificatesDao.get(id);

      return {
        id,
        certificate,
        backUrl,
      };
    }

    dependencies = getDependencies();
    state: ControllerState = {
      showAddedToCart: false,
      addedToCartQuantity: 0,
    };

    addToCart = (quantity: number) => {
      const { cart } = this.dependencies;
      const { certificate } = this.props;

      if (certificate) {
        cart.add(certificate, quantity);

        this.setState({
          showAddedToCart: true,
          addedToCartQuantity: quantity,
        });
      }
    };

    closeAddedToCart = () => {
      this.setState({ showAddedToCart: false });
    };

    render() {
      const { addToCart, closeAddedToCart } = this;
      const { showAddedToCart, addedToCartQuantity } = this.state;

      return renderContent(this.dependencies, {
        ...this.props,
        addToCart,
        showAddedToCart,
        addedToCartQuantity,
        closeAddedToCart,
      });
    }
  };

export default wrapCertificatePageController(
  getDependencies,
  ({ cart }, props) => (
    <AppLayout navProps={{ cart, link: 'checkout' }}>
      <CertificatePageContent {...props} />
    </AppLayout>
  )
);
