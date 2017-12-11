// @flow

import React, { type Element as ReactElement } from 'react';
import Head from 'next/head';
import Link from 'next/link';

import type { DeathCertificate } from '../../types';

import {
  CERTIFICATE_COST_STRING,
  PERCENTAGE_CC_STRING,
  FIXED_CC_STRING,
} from '../../../lib/costs';

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

  quantityField: ?HTMLInputElement = null;

  handleQuantityChange = (ev: SyntheticInputEvent<*>) => {
    const { value } = ev.target;

    if (value === 'other') {
      this.setState({ quantity: null });
      if (this.quantityField) {
        this.quantityField.focus();
      }
    } else {
      this.setState({
        quantity: value ? parseInt(value, 10) : null,
      });
    }
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

  setQuantityField = (quantityField: ?HTMLInputElement) => {
    this.quantityField = quantityField;
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

    const { firstName, lastName } = certificate || {
      firstName: null,
      lastName: null,
    };

    return (
      <div className="content">
        <Head>
          <title>Boston.gov — Death Certificate #{id}</title>
        </Head>

        <div className="p-a300">
          {backUrl && (
            <div className="m-b500">
              <Link href={backUrl}>
                <a style={{ fontStyle: 'italic' }}>← Back to search results</a>
              </Link>
            </div>
          )}

          <div className="sh sh--b0">
            <h1 className="sh-title" style={{ marginBottom: 0 }}>
              {firstName} {lastName}
            </h1>
          </div>
        </div>

        <div className="p-a300 b--w certificate-wrapper">
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

        <style jsx>
          {`
            .content,
            .certificate-wrapper {
              flex: 1;
              display: flex;
              flex-direction: column;
            }
          `}
        </style>
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
      <div className="certificate">
        <ul className="dl">
          <li className="dl-i">
            <span className="dl-t">ID #</span>
            <span className="dl-d">{id}</span>
          </li>
          <li className="dl-i">
            <span className="dl-t">First name</span>
            <span className="dl-d">{firstName}</span>
          </li>
          <li className="dl-i">
            <span className="dl-t">Last name</span>
            <span className="dl-d">{lastName}</span>
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
        </ul>

        <div className="m-v500 ">
          <form
            onSubmit={this.handleAddToCart}
            className="js-add-to-cart-form "
          >
            <input
              ref={this.setQuantityField}
              type="text"
              id="quantity"
              name="quantity"
              className="txt-f txt-f--combo txt-f--auto ta-r"
              size="5"
              value={quantity || ''}
              onChange={this.handleQuantityChange}
            />

            <div className="sel-c sel-c--sq">
              <label htmlFor="quantity" className="a11y--h">
                Quantity:
              </label>

              <select
                name="quantityMenu"
                value={quantity && quantity <= 10 ? quantity : 'other'}
                className="sel-f sel-f--sq quantity-dropdown"
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
                <option disabled>---------------</option>
                <option value="other">Other…</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn add-to-cart"
              disabled={!quantity}
            >
              Add to Cart
            </button>
          </form>

          <p className="t--subinfo">
            Death certificates cost {CERTIFICATE_COST_STRING} each. That price
            includes shipping. You will be charged an extra service fee of not
            more than {FIXED_CC_STRING} plus {PERCENTAGE_CC_STRING}. That fee
            goes directly to a third party to pay for the cost of card
            processing. Learn more about{' '}
            <a href="https://www.boston.gov/">card service fees</a> at the City
            of Boston.
          </p>
        </div>

        <style jsx>{`
          .certificate {
            display: flex;
            flex-direction: column;
            flex: 1;
            justify-content: space-between;
          }
          .dl-i {
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }
          .dl-t {
            padding-right: 1em;
            width: 30%;
          }
          .dl-t,
          .dl-d {
            line-height: 1rem;
            vertical-align: center;
          }
          form {
            display: flex;
            align-items: center;
          }

          .quantity-dropdown:after {
            content: 'Qty.';
          }

          .add-to-cart {
            flex: 1;
            margin-left: 1em;
            height: 62px;
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
    <AppLayout navProps={{ cart }}>
      <CertificatePageContent {...props} />
    </AppLayout>
  )
);
