import React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';
import { css } from 'emotion';

import { PageDependencies, GetInitialProps } from '../../../pages/_app';
import { DeathCertificate } from '../../types';

import { DEATH_CERTIFICATE_COST_STRING } from '../../../lib/costs';

import PageLayout from '../../PageLayout';

import { DeathBreadcrumbNavLinks } from '../breadcrumbs';

import { serviceFeeDisclosureText } from '../../common/FeeDisclosures';

interface InitialProps {
  id: string;
  certificate: DeathCertificate | null;
  backUrl: string | null;
}

interface Props
  extends InitialProps,
    Pick<PageDependencies, 'deathCertificateCart' | 'siteAnalytics'> {}

interface State {
  quantity: number | null;
}

const CERTIFICATE_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  justifyContent: 'space-between',
});

const LIST_ITEM_STYLE = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

const LIST_ITEM_ELEMENT_STYLE = css({
  lineHeight: '1rem',
  verticalAlign: 'center',
});

const LIST_ITEM_TITLE_STYLE = css(LIST_ITEM_ELEMENT_STYLE, {
  paddingRight: '1em',
  width: '30%',
});

const ADD_TO_CART_FORM_STYLE = css({
  display: 'flex',
  alignItems: 'center',
});

const QUANTITY_DROPDOWN_STYLE = css({
  '&:after': {
    content: "'Qty,'",
  },
});

@observer
class CertificatePage extends React.Component<Props, State> {
  state: State;
  quantityField: HTMLInputElement | null = null;

  static getInitialProps: GetInitialProps<
    InitialProps,
    'query' | 'res',
    'deathCertificatesDao'
  > = async ({ query: { id, backUrl }, res }, { deathCertificatesDao }) => {
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
  };

  constructor(props: Props) {
    super(props);

    const { id, deathCertificateCart } = props;

    this.state = {
      quantity: deathCertificateCart.getQuantity(id) || 1,
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
      const { certificate, deathCertificateCart, siteAnalytics } = this.props;

      if (certificate) {
        if (quantity === 0) {
          deathCertificateCart.remove(certificate.id);

          siteAnalytics.sendEvent('click', {
            category: 'UX',
            label: 'add to cart',
          });
        } else {
          deathCertificateCart.setQuantity(certificate, quantity);
          siteAnalytics.sendEvent('click', {
            category: 'UX',
            label: 'add to cart',
          });

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
    const { id, certificate, backUrl, deathCertificateCart } = this.props;

    const { firstName, lastName } = certificate || {
      firstName: null,
      lastName: null,
    };

    const fullName = certificate
      ? `${firstName || ''} ${lastName || ''}`
      : null;

    return (
      <PageLayout
        showNav
        cart={deathCertificateCart}
        breadcrumbNav={DeathBreadcrumbNavLinks}
      >
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
              Death certificates cost {DEATH_CERTIFICATE_COST_STRING} each. That
              price includes shipping. {serviceFeeDisclosureText()}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  renderCertificate({
    firstName,
    lastName,
    age,
    deathDate,
    deathYear,
    birthDate,
  }: DeathCertificate) {
    return (
      <div className={CERTIFICATE_STYLE}>
        <ul className="dl">
          <li className={`dl-i ${LIST_ITEM_STYLE}`}>
            <span className={`dl-t ${LIST_ITEM_TITLE_STYLE}`}>First name</span>
            <span className={`dl-d ${LIST_ITEM_ELEMENT_STYLE}`}>
              {firstName}
            </span>
          </li>
          <li className={`dl-i ${LIST_ITEM_STYLE}`}>
            <span className={`dl-t ${LIST_ITEM_TITLE_STYLE}`}>Last name</span>
            <span className={`dl-d ${LIST_ITEM_ELEMENT_STYLE}`}>
              {lastName}
            </span>
          </li>
          {birthDate && (
            <li className={`dl-i ${LIST_ITEM_STYLE}`}>
              <span className={`dl-t ${LIST_ITEM_TITLE_STYLE}`}>
                Date of birth
              </span>
              <span className={`dl-d ${LIST_ITEM_ELEMENT_STYLE}`}>
                {birthDate}
              </span>
            </li>
          )}
          <li className={`dl-i ${LIST_ITEM_STYLE}`}>
            <span className={`dl-t ${LIST_ITEM_TITLE_STYLE}`}>
              Date of death
            </span>
            <span className={`dl-d ${LIST_ITEM_ELEMENT_STYLE}`}>
              {deathDate || deathYear}
            </span>
          </li>
          {age && (
            <li className={`dl-i ${LIST_ITEM_STYLE}`}>
              <span className={`dl-t ${LIST_ITEM_TITLE_STYLE}`}>Age</span>
              <span className={`dl-d ${LIST_ITEM_ELEMENT_STYLE}`}>{age}</span>
            </li>
          )}
        </ul>
      </div>
    );
  }

  renderAddToCart() {
    const { deathCertificateCart, id } = this.props;
    const { quantity } = this.state;

    const cartQuantity = deathCertificateCart.getQuantity(id);

    return (
      <form onSubmit={this.handleAddToCart} className={ADD_TO_CART_FORM_STYLE}>
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
          <div className={`sel-c sel-c--sq ${QUANTITY_DROPDOWN_STYLE}`}>
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
      </form>
    );
  }
}

export default (CertificatePage as any) as React.ComponentClass<Props> & {
  getInitialProps: (typeof CertificatePage)['getInitialProps'];
};
