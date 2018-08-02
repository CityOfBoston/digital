import React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';

import { getDependencies, ClientContext, ClientDependencies } from '../../app';
import { DeathCertificate } from '../../types';

import Cart from '../../store/Cart';
import SiteAnalytics from '../../lib/SiteAnalytics';

import {
  CERTIFICATE_COST_STRING,
  PERCENTAGE_CC_STRING,
  FIXED_CC_STRING,
  SERVICE_FEE_URI,
} from '../../../lib/costs';

import AppLayout from '../../AppLayout';

interface DefaultProps {
  cart: Cart;
  siteAnalytics: SiteAnalytics;
}

interface InitialProps {
  id: string;
  certificate: DeathCertificate | null;
  backUrl: string | null;
}

interface Props extends InitialProps, Partial<DefaultProps> {}

interface State {
  quantity: number | null;
}

@observer
class CertificatePage extends React.Component<Props & DefaultProps, State> {
  state: State;
  quantityField: HTMLInputElement | null = null;

  static get defaultProps(): DefaultProps {
    const { cart, siteAnalytics } = getDependencies();
    return { cart, siteAnalytics };
  }

  static async getInitialProps(
    ctx: ClientContext,
    dependenciesForTest?: ClientDependencies
  ): Promise<InitialProps> {
    const {
      query: { id, backUrl },
      res,
    } = ctx;
    const { deathCertificatesDao } =
      dependenciesForTest || getDependencies(ctx);

    if (!id) {
      throw new Error('Missing id');
    }

    const certificate = await deathCertificatesDao.get(id);

    if (!certificate && res) {
      res.statusCode = 404;
    }

    return {
      id,
      certificate,
      backUrl,
    };
  }

  constructor(props: Props & DefaultProps) {
    super(props);

    const { id, cart } = props;

    this.state = {
      quantity: cart.getQuantity(id) || 1,
    };
  }

  componentWillMount() {
    const { siteAnalytics, id } = this.props;

    siteAnalytics.addProduct(id, 'Death certificate', 'Death certificate');
    siteAnalytics.setProductAction('detail');
  }

  setCartQuantity = action(
    'CertificatePageController setCartQuantity',
    async (quantity: number) => {
      const { certificate, cart, siteAnalytics } = this.props;

      if (certificate) {
        if (quantity === 0) {
          cart.remove(certificate.id);

          siteAnalytics.sendEvent('UX', 'click', 'add to cart');
        } else {
          cart.setQuantity(certificate, quantity);
          siteAnalytics.sendEvent('UX', 'click', 'add to cart');

          await Router.push('/death/cart');
          window.scroll(0, 0);
        }
      }
    }
  );

  handleQuantityChange = (
    ev: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { value } = ev.target;

    if (value === 'other') {
      this.setState({ quantity: null });
      if (this.quantityField) {
        this.quantityField.focus();
      }
    } else {
      this.setState({
        quantity: value ? Math.max(0, Math.min(parseInt(value, 10), 99)) : null,
      });
    }
  };

  handleAddToCart = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const { quantity } = this.state;

    if (typeof quantity !== 'number') {
      return;
    }

    this.setCartQuantity(quantity);
  };

  setQuantityField = (quantityField: HTMLInputElement | null) => {
    this.quantityField = quantityField;
  };

  render() {
    const { id, certificate, backUrl } = this.props;

    const { firstName, lastName } = certificate || {
      firstName: null,
      lastName: null,
    };

    const fullName = certificate
      ? `${firstName || ''} ${lastName || ''}`
      : null;

    return (
      <AppLayout showNav>
        <div className="b-ff">
          <Head>
            <title>
              Boston.gov — Death Certificates — {fullName || `#${id}`}
            </title>
          </Head>

          <div className="b-c b-c--nbp b-ff">
            <div className="sh sh--b0">
              <h1 className="sh-title">
                {fullName || 'Certificate not found'}
              </h1>
            </div>

            {certificate &&
              certificate.pending && (
                <div className="br br--r br-a200 m-v300 p-a300 t--info">
                  This certificate is <strong>pending</strong> and will not
                  include the cause of death. Some insurance and banking
                  companies won’t accept a death certificate if it is still
                  pending.
                </div>
              )}

            <div className="m-v300 b-ff">
              {certificate && this.renderCertificate(certificate)}
              {!certificate && (
                <div className="t--info">
                  We could not find a certificate with ID #{id}.
                </div>
              )}
            </div>

            <div className="g g--r g--vc">
              <div className="g--5 m-v300">
                {certificate && this.renderAddToCart()}
              </div>

              <div className="g--7 m-v300">
                {backUrl ? (
                  <Link href={backUrl}>
                    <a style={{ fontStyle: 'italic' }}>
                      ← Back to search results
                    </a>
                  </Link>
                ) : (
                  <Link href="/death">
                    <a style={{ fontStyle: 'italic' }}>← Go to search</a>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="b--g m-t700">
            <div className="b-c b-c--smv t--subinfo">
              Death certificates cost {CERTIFICATE_COST_STRING} each. That price
              includes shipping. You will be charged an extra service fee of not
              more than {FIXED_CC_STRING} plus {PERCENTAGE_CC_STRING}. That fee
              goes directly to a third party to pay for the cost of card
              processing. Learn more about{' '}
              <a href={SERVICE_FEE_URI}>card service fees</a> at the City of
              Boston.
            </div>
          </div>
        </div>
      </AppLayout>
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
    return (
      <div className="certificate">
        <ul className="dl">
          <li className="dl-i">
            <span className="dl-t">Certificate #</span>
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

        <style jsx>{`
          .certificate {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
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
        `}</style>
      </div>
    );
  }

  renderAddToCart() {
    const { cart, id } = this.props;
    const { quantity } = this.state;

    const cartQuantity = cart.getQuantity(id);

    return (
      <form onSubmit={this.handleAddToCart} className="js-add-to-cart-form">
        <div className="m-r100">
          <input
            ref={this.setQuantityField}
            type="text"
            name="quantity"
            aria-label="Quantity"
            className="txt-f txt-f--combo txt-f--auto ta-r"
            size={3}
            value={
              typeof quantity === 'number' && quantity >= 0 ? quantity : ''
            }
            onChange={this.handleQuantityChange}
          />
          <div className="sel-c sel-c--sq quantity-dropdown">
            <select
              name="quantityMenu"
              aria-label="Quantity menu"
              value={
                typeof quantity === 'number' && quantity <= 10
                  ? quantity
                  : 'other'
              }
              className="sel-f sel-f--sq"
              onChange={this.handleQuantityChange}
            >
              {cartQuantity
                ? [
                    <option value="0" key="remove">
                      Remove
                    </option>,
                    <option disabled key="separator">
                      ---------------
                    </option>,
                  ]
                : null}
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
        </div>
        <button
          type="submit"
          className="btn btn--row"
          disabled={quantity === cartQuantity || quantity === null}
        >
          {cartQuantity ? 'Update Cart' : 'Add to Cart'}
        </button>
        <style jsx>{`
          form {
            display: flex;
            align-items: center;
          }

          .quantity-dropdown:after {
            content: 'Qty.';
          }
        `}</style>
      </form>
    );
  }
}

export default (CertificatePage as any) as React.ComponentClass<Props> & {
  getInitialProps: (typeof CertificatePage)['getInitialProps'];
};
