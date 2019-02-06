import React from 'react';
import Head from 'next/head';
import Router from 'next/router';

import { observer } from 'mobx-react';

import { css } from 'emotion';

import {
  CHARLES_BLUE,
  FREEDOM_RED_DARK,
  GRAY_100,
  OPTIMISTIC_BLUE_DARK,
  SERIF,
  WHITE,
} from '@cityofboston/react-fleet';

import { PageDependencies } from '../../pages/_app';

import PageWrapper from './PageWrapper';
import CostSummary from '../common/CostSummary';

import BackButton from './components/BackButton';

import { SECTION_HEADING_STYLING } from './styling';

interface Props extends Pick<PageDependencies, 'birthCertificateRequest'> {}

/**
 * Component which allows a user to review their request, and update the
 * quantity of birth certificates they are requesting.
 *
 * User can proceed to /checkout, go back to the questions flow, or
 * clear all information and start over.
 */
@observer
export default class ReviewRequestPage extends React.Component<Props> {
  componentDidMount() {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

  private handleQuantityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Update quantity; if user erases value in field, quantity will return to 1
    this.props.birthCertificateRequest.setQuantity(+event.target.value || 1);
  };

  // todo: warn user before resetting information (i.e. “are you sure? y/n” dialog)
  private userResetStartOver = () => {
    this.props.birthCertificateRequest.clearBirthCertificateRequest();

    this.returnToQuestions();
  };

  private returnToQuestions = () => {
    const {
      birthCertificateRequest: { steps },
    } = this.props;

    const currentStepIndex = steps.indexOf('reviewRequest');

    Router.push(`/birth?step=${steps[currentStepIndex - 1]}`);
  };

  private goToCheckout = () => {
    Router.push('/birth/checkout');
  };

  public render() {
    const {
      firstName,
      lastName,
      birthDate,
    } = this.props.birthCertificateRequest.requestInformation;
    const { quantity, steps } = this.props.birthCertificateRequest;
    const pageTitle = 'Review your record request';

    return (
      <PageWrapper
        progress={{
          totalSteps: steps.length,
          currentStep: steps.indexOf('reviewRequest') + 1,
          currentStepCompleted: true,
        }}
      >
        <Head>
          <title>Boston.gov — {pageTitle}</title>
        </Head>

        <h2 className={SECTION_HEADING_STYLING}>{pageTitle}</h2>

        <p>
          You can only order copies of one person’s birth certificate at a time.
          If you want to buy copies of a certificate for another person, you
          need to do a separate transaction.
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
                {firstName} {lastName}
              </div>
              <div className={CERTIFICATE_SUBINFO_STYLE}>
                <span style={{ marginRight: '2em' }}>
                  Birth Certificate (Paper Copy)
                </span>
                <br />
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

        <div className="m-t700 g g--r">
          <div className="g--6 ta-r m-b500">
            <button
              className="btn btn--b-sm"
              type="button"
              onClick={this.goToCheckout}
            >
              Continue
            </button>
          </div>

          <div className="g--6 m-b500">
            <BackButton handleClick={this.returnToQuestions} />
          </div>
        </div>
      </PageWrapper>
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
  background: OPTIMISTIC_BLUE_DARK,
  color: WHITE,
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
  fontFamily: SERIF,
  fontStyle: 'italic',
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
  color: FREEDOM_RED_DARK,
  fontSize: '2.5rem',
  verticalAlign: 'middle',
  cursor: 'pointer',
  padding: '0 0 0.2em',
});
