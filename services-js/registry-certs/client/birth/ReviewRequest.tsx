import React from 'react';
import Head from 'next/head';
import Router from 'next/router';

import { observer } from 'mobx-react';

import { css } from 'emotion';

import {
  CHARLES_BLUE,
  FREEDOM_RED,
  GRAY_100,
  OPTIMISTIC_BLUE,
} from '@cityofboston/react-fleet';

import { PageDependencies } from '../../pages/_app';

import PageLayout from '../PageLayout';
import CostSummary from '../common/CostSummary';

import { BREADCRUMB_NAV_LINKS } from './constants';

import {
  BUTTONS_CONTAINER_STYLING,
  SECONDARY_BUTTON_STYLE,
} from './questions/styling';

interface Props extends Pick<PageDependencies, 'birthCertificateRequest'> {}

/**
 * Component which allows a user to review their request, and update the
 * quantity of birth certificates they are requesting.
 *
 * User can proceed to /checkout, go back to the questions flow, or
 * clear all information and start over.
 */
@observer
export default class ReviewRequest extends React.Component<Props> {
  handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update quantity; if user erases value in field, quantity will return to 1
    this.props.birthCertificateRequest.setQuantity(+event.target.value || 1);
  };

  // todo: warn user before resetting information (i.e. “are you sure? y/n” dialog)
  userResetStartOver = () => {
    this.props.birthCertificateRequest.clearBirthCertificateRequest();

    this.returnToQuestions();
  };

  returnToQuestions = () => {
    Router.push('/birth');
  };

  goToCheckout = () => {
    Router.push('/birth/checkout');
  };

  render() {
    const {
      firstName,
      lastName,
      birthDate,
    } = this.props.birthCertificateRequest.requestInformation;

    const { quantity } = this.props.birthCertificateRequest;

    return (
      <>
        <Head>
          <title>Boston.gov — Review your record request</title>

          <style>{'.txt-f { border-radius: 0; }'}</style>
        </Head>

        <PageLayout breadcrumbNav={BREADCRUMB_NAV_LINKS}>
          <div className="b-c b-c--nbp">
            <h1 className="sh-title">Review your record request</h1>
            <section className="v-t300">
              <p>
                You can only order copies of one person’s birth certificate at a
                time. If you want to buy copies of a certificate for another
                person, you need to do a separate transaction.
              </p>
              <p>
                If you are requesting a restricted record, you will need to
                provide a valid form of identification (i.e. driver’s license,
                state ID, military ID, or passport) after you pay.
              </p>

              <div>
                <div className={CERTIFICATE_ROW_STYLE}>
                  <input
                    type="number"
                    min="1"
                    aria-label="Certificate quantity"
                    className={`br br-a150 ${QUANTITY_BOX_STYLE}`}
                    value={quantity}
                    onChange={this.handleQuantityChange}
                    title="Certificate Quantity"
                  />

                  <div className={`t--sans ${CERTIFICATE_INFO_BOX_STYLE}`}>
                    <div className={CERTIFICATE_NAME_STYLE}>
                      Birth Certificate (Paper Copy)
                    </div>
                    <div className={CERTIFICATE_SUBINFO_STYLE}>
                      <span style={{ marginRight: '2em' }}>
                        {firstName} {lastName}
                      </span>
                      <span>Born: {birthDate}</span>
                    </div>
                  </div>

                  <button
                    className={REMOVE_BUTTON_STYLE}
                    type="button"
                    onClick={this.userResetStartOver}
                    aria-label="Remove and start over"
                    title="Remove and start over"
                  >
                    ×
                  </button>
                </div>
              </div>

              <CostSummary
                certificateType="birth"
                certificateQuantity={quantity}
                allowServiceFeeTypeChoice
                serviceFeeType="CREDIT"
              />

              <div className={BUTTONS_CONTAINER_STYLING}>
                <button
                  className={`btn ${SECONDARY_BUTTON_STYLE}`}
                  type="button"
                  onClick={this.returnToQuestions}
                >
                  Back to last question
                </button>

                <button
                  className="btn"
                  type="button"
                  onClick={this.goToCheckout}
                >
                  Proceed to checkout
                </button>
              </div>
            </section>
          </div>
        </PageLayout>
      </>
    );
  }
}

const QUANTITY_BOX_STYLE = css({
  width: '2.5rem',
  height: '2.5rem',
  marginRight: '1rem',
  fontFamily: 'inherit',
  fontStyle: 'italic',
  fontSize: '1rem',
  background: OPTIMISTIC_BLUE,
  color: 'white',
  textAlign: 'right',
  padding: '0.5rem',
  '-moz-appearance': 'textfield',
  '&::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
  },
});

const CERTIFICATE_NAME_STYLE = css({
  fontStyle: 'normal',
  fontWeight: 'bold',
  letterSpacing: '1.4px',
});

const CERTIFICATE_INFO_BOX_STYLE = css({ flex: 1 });

const CERTIFICATE_SUBINFO_STYLE = css({
  color: CHARLES_BLUE,
});

const CERTIFICATE_ROW_STYLE = css({
  borderBottom: `1px solid ${GRAY_100}`,
  borderTop: `1px solid ${GRAY_100}`,

  paddingBottom: '0.5em',
  paddingTop: '0.5em',
  marginBottom: '1em',
  marginTop: '3em',

  display: 'flex',
  alignItems: 'center',
});

const REMOVE_BUTTON_STYLE = css({
  border: 'none',
  background: 'transparent',
  color: FREEDOM_RED,
  fontSize: '2.5rem',
  verticalAlign: 'middle',
  cursor: 'pointer',
  padding: '0 0 0.2em',
});
