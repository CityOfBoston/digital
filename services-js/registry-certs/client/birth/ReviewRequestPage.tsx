import React from 'react';
import Head from 'next/head';
import Router from 'next/router';

import { observer } from 'mobx-react';

import { css } from 'emotion';

import { CHARLES_BLUE, GRAY_100, SERIF } from '@cityofboston/react-fleet';

import { PageDependencies } from '../../pages/_app';

import PageWrapper from './PageWrapper';
import CostSummary from '../common/CostSummary';

import QuantityDropdown from './components/QuantityDropdown';
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
    window.scroll(0, 0);
  }

  private handleQuantityChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    // Update quantity; if user erases value in field, quantity will return to 1
    this.props.birthCertificateRequest.setQuantity(+event.target.value || 1);
  };

  private userResetStartOver = () => {
    this.props.birthCertificateRequest.clearBirthCertificateRequest();
    Router.push('/birth');
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
    } = this.props.birthCertificateRequest.requestInformation;
    const {
      quantity,
      steps,
      birthDateString,
    } = this.props.birthCertificateRequest;
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

        <div className={CERTIFICATE_ROW_STYLE}>
          <QuantityDropdown
            quantity={quantity}
            handleQuantityChange={this.handleQuantityChange}
          />

          <div className={`t--sans ${CERTIFICATE_INFO_BOX_STYLE}`}>
            <div className={CERTIFICATE_NAME_STYLE}>
              {firstName} {lastName}
            </div>
            <div className={CERTIFICATE_SUBINFO_STYLE}>
              <span>Birth Certificate (Paper Copy)</span>
              <span>Born: {birthDateString}</span>
            </div>
          </div>
        </div>

        <CostSummary
          certificateType="birth"
          certificateQuantity={quantity}
          allowServiceFeeTypeChoice
          serviceFeeType="CREDIT"
        />

        <div className="g g--mr m-t700">
          <div className="g--9 t--info">
            <BackButton handleClick={this.returnToQuestions} />
          </div>

          <button
            className="btn g--3"
            type="button"
            onClick={this.goToCheckout}
          >
            Continue
          </button>
        </div>

        <div className="ta-c m-t700 p-a300 t--sans">
          <button
            className="lnk cancel tt-u"
            type="button"
            onClick={this.userResetStartOver}
          >
            Cancel and start over
          </button>
        </div>
      </PageWrapper>
    );
  }
}

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

  '> span': {
    display: 'block',
  },
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

  '> div:first-of-type': {
    flexBasis: '25%',
  },
});
