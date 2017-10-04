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
  quantity: ?number,
};

export class CertificatePageContent extends React.Component<
  ContentProps,
  ContentState
> {
  state = {
    quantity: 1,
  };

  handleQuantityChange = (ev: SyntheticInputEvent<*>) => {
    const { value } = ev.target;

    this.setState({
      quantity: value ? parseInt(value, 10) : null,
    });
  };

  handleAddToCart = (ev: SyntheticInputEvent<*>) => {
    ev.preventDefault();

    const { addToCart } = this.props;
    const { quantity } = this.state;

    if (!quantity) {
      return;
    }

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

        <div className="p-a300">
          {backUrl && (
            <div className="m-b300">
              <Link href={backUrl}>
                <a style={{ fontStyle: 'italic' }}>← Back to search</a>
              </Link>
            </div>
          )}

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
    id,
    firstName,
    lastName,
    age,
    deathDate,
    deathYear,
    birthDate,
  }: DeathCertificate) {
    const { quantity } = this.state;

    return (
      <div>
        <ul className="dl">
          <li className="dl-i">
            <span className="dl-t">ID #</span>
            <span className="dl-d">{id}</span>
          </li>
          <li className="dl-i">
            <span className="dl-t">Full name</span>
            <span className="dl-d">
              {firstName} {lastName}
            </span>
          </li>
          {birthDate && (
            <li className="dl-i">
              <span className="dl-t">Date of birth</span>
              <span className="dl-d">{birthDate}</span>
            </li>
          )}
          <li className="dl-i">
            <span className="dl-t">Date of death</span>
            <span className="dl-d">{deathDate || deathYear}</span>
          </li>
          {age && (
            <li className="dl-i">
              <span className="dl-t">Age</span>
              <span className="dl-d">{age}</span>
            </li>
          )}

          <style jsx>{`
            .dl-i {
              display: flex;
              align-items: center;
              justify-content: flex-start;
            }
            .dl-t {
              padding-right: 1em;
            }
            .dl-t,
            .dl-d {
              line-height: 1rem;
              vertical-align: center;
            }
          `}</style>
        </ul>

        <form
          onSubmit={this.handleAddToCart}
          className="js-add-to-cart-form m-v500"
        >
          <input
            type="text"
            id="quantity"
            name="quantity"
            className="txt-f"
            value={quantity}
            onChange={this.handleQuantityChange}
          />

          <div className="sel-c sel-c--sq">
            <label htmlFor="quantity" className="a11y--h">
              Quantity:
            </label>

            <select
              name="quantityMenu"
              value={quantity}
              className="sel-f sel-f--sq"
              onChange={this.handleQuantityChange}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn add-to-cart"
            disabled={!quantity}
          >
            Add to Cart
          </button>

          <style jsx>{`
            form {
              display: flex;
              align-items: center;
            }

            .txt-f {
              /* matches the select box */
              height: 62px;
              width: 4em !important;
              text-align: right;
              border-right: none;
            }

            .sel-c:after {
              content: 'Qty.';
            }

            .add-to-cart {
              flex: 1;
              margin-left: 1em;
              height: 62px;
            }
          `}</style>
        </form>
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
