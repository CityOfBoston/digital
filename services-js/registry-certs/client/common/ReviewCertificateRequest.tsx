/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent, Component, ReactChild } from 'react';

import Router from 'next/router';

import { observer } from 'mobx-react';

import { CHARLES_BLUE, SERIF } from '@cityofboston/react-fleet';

import { capitalize } from '../../lib/helpers';

import { CERTIFICATE_COST } from '../../lib/costs';

import CostSummary from './CostSummary';

import QuantityDropdown from './QuantityDropdown';
import BackButton from './question-components/BackButton';

import { THIN_BORDER_STYLE } from './question-components/styling';

interface Props {
  testDontScroll?: boolean;
  certificateType: 'birth' | 'marriage';
  certificateRequest: any;
  siteAnalytics: any;
  children: ReactChild | ReactChild[];
}

/**
 * Component which allows a user to review their request, and update the
 * quantity of certificates they are requesting.
 *
 * User can proceed to /checkout, go back to the questions flow, or
 * clear all information and start over.
 */
@observer
export default class ReviewCertificateRequest extends Component<Props> {
  componentDidMount() {
    const { certificateType, siteAnalytics, testDontScroll } = this.props;

    if (!testDontScroll) {
      window.scroll(0, 0);
    }

    // // Since user has provided all needed information by this point, we
    // // will count this birth certificate as a trackable product.
    siteAnalytics.addProduct(
      '0',
      `${capitalize(certificateType)} certificate`,
      `${capitalize(certificateType)} certificate`,
      this.props.certificateRequest.quantity,
      CERTIFICATE_COST[certificateType.toUpperCase()] / 100
    );

    siteAnalytics.setProductAction('detail');
  }

  private handleQuantityChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { certificateRequest, certificateType, siteAnalytics } = this.props;

    const oldValue = certificateRequest.quantity;
    // Quantity can never be less than 1
    const newValue = +event.target.value || 1;
    const difference = Math.abs(oldValue - newValue);

    // Update quantity; if user erases value in field, quantity will return to 1
    certificateRequest.setQuantity(newValue);

    siteAnalytics.sendEvent('change certificate quantity', {
      category: capitalize(certificateType),
      label: oldValue > newValue ? 'decrease' : 'increase',
      value: oldValue > newValue ? -difference : difference,
    });
  };

  private userResetStartOver = () => {
    const { certificateType, siteAnalytics } = this.props;

    this.props.certificateRequest.clearCertificateRequest();

    siteAnalytics.sendEvent('user reset', {
      category: capitalize(certificateType),
      label: 'start over',
    });

    Router.push(`/${certificateType}`);
  };

  private returnToQuestions = () => {
    const { certificateRequest, certificateType, siteAnalytics } = this.props;

    const currentStepIndex = certificateRequest.steps.indexOf('reviewRequest');

    siteAnalytics.addProduct(
      '0',
      `${capitalize(certificateType)} certificate`,
      `${capitalize(certificateType)} certificate`,
      certificateRequest.quantity,
      CERTIFICATE_COST[certificateType.toUpperCase()] / 100
    );

    siteAnalytics.setProductAction('remove');

    Router.push(
      `/${certificateType}?step=${
        certificateRequest.steps[currentStepIndex - 1]
      }`
    );
  };

  private goToCheckout = () => {
    Router.push(`/${this.props.certificateType}/checkout`);
  };

  public render() {
    const { certificateRequest, certificateType } = this.props;
    const { quantity } = certificateRequest;

    return (
      <>
        {this.props.children}

        <div css={CERTIFICATE_ROW_STYLE}>
          <QuantityDropdown
            quantity={quantity}
            handleQuantityChange={this.handleQuantityChange}
          />

          <div className="t--sans" css={CERTIFICATE_INFO_BOX_STYLE}>
            <div css={CERTIFICATE_NAME_STYLE}>
              {certificateType === 'birth'
                ? certificateRequest.fullName
                : `${certificateRequest.fullName1} & ${
                    certificateRequest.fullName2
                  }`}
            </div>
            <div css={CERTIFICATE_SUBINFO_STYLE}>
              <span>
                {capitalize(certificateType)} Certificate (Certified paper copy)
              </span>
              <span>
                {certificateType === 'birth' ? 'Born: ' : 'Date: '}{' '}
                {certificateRequest.dateString}
              </span>
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
            disabled={!this.props.certificateRequest.questionStepsComplete}
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
      </>
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
