/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent, Component } from 'react';

import Head from 'next/head';
import Router from 'next/router';

import { observer } from 'mobx-react';

import {
  DetailsDisclosure,
  CHARLES_BLUE,
  SERIF,
} from '@cityofboston/react-fleet';

import { PageDependencies } from '../../pages/_app';

import PageWrapper from '../PageWrapper';
import CostSummary from '../common/CostSummary';

import QuantityDropdown from '../common/QuantityDropdown';
import BackButton from '../common/question-components/BackButton';

import { ServiceFeeDisclosure } from '../common/FeeDisclosures';
import { CERTIFICATE_COST } from '../../lib/costs';

import {
  SECTION_HEADING_STYLING,
  THIN_BORDER_STYLE,
} from '../common/question-components/styling';

const BIRTH_CERTIFICATE_COST = CERTIFICATE_COST.BIRTH;

interface Props
  extends Pick<PageDependencies, 'birthCertificateRequest' | 'siteAnalytics'> {
  testDontScroll?: boolean;
}

/**
 * Component which allows a user to review their request, and update the
 * quantity of birth certificates they are requesting.
 *
 * User can proceed to /checkout, go back to the questions flow, or
 * clear all information and start over.
 */
@observer
export default class ReviewRequestPage extends Component<Props> {
  componentDidMount() {
    const { siteAnalytics, testDontScroll } = this.props;

    if (!testDontScroll) {
      window.scroll(0, 0);
    }

    // Since user has provided all needed information by this point, we
    // will count this birth certificate as a trackable product.
    siteAnalytics.addProduct(
      '0',
      'Birth certificate',
      'Birth certificate',
      this.props.birthCertificateRequest.quantity,
      BIRTH_CERTIFICATE_COST / 100
    );

    siteAnalytics.setProductAction('detail');
  }

  private handleQuantityChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { siteAnalytics } = this.props;
    const oldValue = this.props.birthCertificateRequest.quantity;
    // Quantity can never be less than 1
    const newValue = +event.target.value || 1;
    const difference = Math.abs(oldValue - newValue);

    // Update quantity; if user erases value in field, quantity will return to 1
    this.props.birthCertificateRequest.setQuantity(newValue);

    siteAnalytics.sendEvent('change certificate quantity', {
      category: 'Birth',
      label: oldValue > newValue ? 'decrease' : 'increase',
      value: oldValue > newValue ? -difference : difference,
    });
  };

  private userResetStartOver = () => {
    const { siteAnalytics } = this.props;

    this.props.birthCertificateRequest.clearBirthCertificateRequest();

    siteAnalytics.sendEvent('user reset', {
      category: 'Birth',
      label: 'start over',
    });

    Router.push('/birth');
  };

  private returnToQuestions = () => {
    const { siteAnalytics } = this.props;
    const {
      birthCertificateRequest: { steps },
    } = this.props;

    const currentStepIndex = steps.indexOf('reviewRequest');

    siteAnalytics.addProduct(
      '0',
      'Birth certificate',
      'Birth certificate',
      this.props.birthCertificateRequest.quantity,
      BIRTH_CERTIFICATE_COST / 100
    );

    siteAnalytics.setProductAction('remove');

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
        certificateType="birth"
        progress={{
          totalSteps: steps.length,
          currentStep: steps.indexOf('reviewRequest') + 1,
          currentStepCompleted: true,
        }}
        footer={<ServiceFeeDisclosure />}
      >
        <Head>
          <title>Boston.gov — {pageTitle}</title>
        </Head>

        <h2 css={SECTION_HEADING_STYLING}>{pageTitle}</h2>

        <p>
          You can only order copies of one person’s birth certificate at a time.
          If you want to buy copies of a certificate for another person, you
          need to do a separate transaction.
        </p>

        <DetailsDisclosure
          summaryContent="Are you requesting a certificate for international use that requires an
      Apostille from the Massachusetts Secretary of State?"
          id="apostille"
        >
          <p>
            You need to have a hand signature from the Registry. After you
            finish your order, please email birth@boston.gov with:
          </p>

          <ul>
            <li>the name of the person on the record</li>
            <li>their date of birth, and</li>
            <li>let us know that you need the signature for an Apostille.</li>
          </ul>
        </DetailsDisclosure>

        <div css={CERTIFICATE_ROW_STYLE}>
          <QuantityDropdown
            quantity={quantity}
            handleQuantityChange={this.handleQuantityChange}
          />

          <div className="t--sans" css={CERTIFICATE_INFO_BOX_STYLE}>
            <div css={CERTIFICATE_NAME_STYLE}>
              {firstName} {lastName}
            </div>
            <div css={CERTIFICATE_SUBINFO_STYLE}>
              <span>Birth Certificate (Certified paper copy)</span>
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
            disabled={!this.props.birthCertificateRequest.questionStepsComplete}
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
  borderBottom: THIN_BORDER_STYLE,
  borderTop: THIN_BORDER_STYLE,

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
