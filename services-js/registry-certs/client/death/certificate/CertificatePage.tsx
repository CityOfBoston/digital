/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import Head from 'next/head';
import Router from 'next/router';

import { getParam } from '@cityofboston/next-client-common';
import {
  ProgressBar,
  CHARLES_BLUE,
  MEDIA_SMALL,
  OPTIMISTIC_BLUE_DARK,
  SANS,
  SERIF,
  WHITE,
} from '@cityofboston/react-fleet';

import { PageDependencies, GetInitialProps } from '../../../pages/_app';
import { DeathCertificate } from '../../types';

import PageLayout from '../../PageLayout';

import { BREADCRUMB_NAV_LINKS } from '../../../lib/breadcrumbs';

import DeathCertificateDetailsTable from './DeathCertificateDetailsTable';
import DeathQuantitySelect from './DeathQuantitySelect';
import { DEATH_APP_TITLE_STYLING } from '../deathFlowTitles';

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

/**
 * STEP 2 — Quantity / certificate details.
 * Layout and copy follow Figma “STEP 2- QUANTITY”.
 *
 * Reuses ProgressBar and standard `btn` primary. Details table and quantity
 * control are custom for this step.
 */
@observer
class CertificatePage extends React.Component<Props, State> {
  state: State;

  static getInitialProps: GetInitialProps<
    InitialProps,
    'query' | 'res',
    'deathCertificatesDao'
  > = async ({ query, res }, { deathCertificatesDao }) => {
    const id = getParam(query.id);

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
      backUrl: getParam(query.backUrl, null),
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
          // Quantity is chosen here (STEP 2); certificate options (STEP 3)
          // collect SSN / relationship / uploads before the item is added.
          const { backUrl } = this.props;
          const query: { [key: string]: string } = {
            id: certificate.id,
            quantity: String(quantity),
          };
          if (backUrl) {
            query.backUrl = backUrl;
          }

          siteAnalytics.sendEvent('click', {
            category: 'UX',
            label: 'continue to certificate options',
          });

          await Router.push({
            pathname: '/death/certificate-options',
            query,
          });
          window.scroll(0, 0);
        }
      }
    }
  );

  handleQuantity = (value: number | null): void => {
    this.setState({
      quantity: value,
    });
  };

  handleContinue = () => {
    const { quantity } = this.state;

    if (typeof quantity !== 'number' || quantity < 1) {
      return;
    }

    this.setCartQuantity(quantity);
  };

  handleBack = () => {
    const { backUrl } = this.props;

    if (backUrl) {
      Router.push(backUrl);
    } else {
      Router.push('/death');
    }
  };

  render() {
    const { id, certificate, deathCertificateCart } = this.props;

    const fullName = certificate
      ? `${certificate.firstName || ''} ${certificate.lastName || ''}`.trim()
      : null;

    return (
      <PageLayout
        showNav
        cart={deathCertificateCart}
        breadcrumbNav={BREADCRUMB_NAV_LINKS.death}
      >
        <div className="b-c b-c--nbp" css={PAGE_STYLING}>
          <Head>
            <title>
              Boston.gov — Death Certificates — {fullName || `#${id}`}
            </title>
          </Head>

          <h1 css={DEATH_APP_TITLE_STYLING}>Request a death certificate</h1>

          <div css={PROGRESS_WRAP_STYLING}>
            <ProgressBar totalSteps={7} currentStep={2} currentStepCompleted />
          </div>

          {certificate && certificate.pending && (
            <div className="br br--r br-a200 m-v300 p-a300 t--info">
              This certificate is <strong>pending</strong> and will not include
              the cause of death. Some insurance and banking companies won’t
              accept a death certificate if it is still pending.
            </div>
          )}

          {!certificate && (
            <div className="t--info m-v300">
              We could not find a certificate with ID #{id}.
            </div>
          )}

          {certificate && this.renderContent(certificate)}
        </div>
      </PageLayout>
    );
  }

  renderContent(certificate: DeathCertificate) {
    const { quantity } = this.state;

    return (
      <div css={FORM_STYLING}>
        <DeathCertificateDetailsTable certificate={certificate} />

        <p css={NOTE_STYLING}>
          Note: If this is not the right person, select Back below to return to 
          the search results and refine your search.
        </p>

        <div css={QUANTITY_SECTION_STYLING}>
          <h2 css={SECTION_TITLE_STYLING}>How many certificates do you need?</h2>

          <div css={QUANTITY_ROW_STYLING}>
            <p css={PRODUCT_LABEL_STYLING}>Death Certificate (Paper copy)</p>
            <DeathQuantitySelect
              quantity={quantity}
              onChange={this.handleQuantity}
            />
          </div>
        </div>

        <div css={BUTTON_ROW_STYLING}>
          <button
            type="button"
            css={SECONDARY_BUTTON_STYLING}
            onClick={this.handleBack}
          >
            Back
          </button>
          <button
            type="button"
            className="btn"
            css={PRIMARY_BUTTON_STYLING}
            aria-disabled={typeof quantity !== 'number' || quantity < 1}
            onClick={ev => {
              if (typeof quantity !== 'number' || quantity < 1) {
                ev.preventDefault();
                return;
              }
              this.handleContinue();
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }
}

export default (CertificatePage as any) as React.ComponentClass<Props> & {
  getInitialProps: (typeof CertificatePage)['getInitialProps'];
};

const PAGE_STYLING = css({
  maxWidth: '45rem',
});

const PROGRESS_WRAP_STYLING = css({
  marginBottom: '2rem',
});

const FORM_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

const NOTE_STYLING = css({
  margin: 0,
  fontFamily: SERIF,
  fontWeight: 700,
  fontSize: '1.125rem',
  lineHeight: 1.4,
  color: CHARLES_BLUE,
});

const QUANTITY_SECTION_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  paddingTop: '40px',
});

const SECTION_TITLE_STYLING = css({
  margin: 0,
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1.125rem',
  lineHeight: 1.2,
  textTransform: 'uppercase',
  color: CHARLES_BLUE,
});

const QUANTITY_ROW_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '1rem',

  [MEDIA_SMALL]: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.25rem',
  },
});

const PRODUCT_LABEL_STYLING = css({
  margin: 0,
  fontFamily: SERIF,
  fontWeight: 500,
  fontSize: '1.125rem',
  lineHeight: 1.2,
  color: CHARLES_BLUE,
});

const BUTTON_ROW_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginTop: '0.5rem',
  marginBottom: '2rem',

  [MEDIA_SMALL]: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '1.5rem',
  },
});

const SECONDARY_BUTTON_STYLING = css({
  appearance: 'none',
  background: WHITE,
  border: '1px solid #d2d2d2',
  color: OPTIMISTIC_BLUE_DARK,
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'uppercase',
  minHeight: '55px',
  minWidth: '10rem',
  padding: '0.625rem 1rem',
  cursor: 'pointer',

  '&:hover, &:focus': {
    background: '#f3f3f3',
  },

  '&:focus': {
    outline: 'none',
  },

  '&:focus-visible': {
    outline: `3px solid ${OPTIMISTIC_BLUE_DARK}`,
    outlineOffset: '2px',
  },
});

const PRIMARY_BUTTON_STYLING = css({
  minHeight: '55px',
  minWidth: '10rem',
  textTransform: 'uppercase',
  fontWeight: 700,

  '&:focus': {
    outline: 'none',
  },

  '&:focus-visible': {
    outline: `3px solid ${OPTIMISTIC_BLUE_DARK}`,
    outlineOffset: '2px',
  },

  '&[aria-disabled="true"]': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});
