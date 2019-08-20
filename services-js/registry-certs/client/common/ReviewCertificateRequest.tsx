/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent, Component, ReactChild } from 'react';

import Router from 'next/router';

import { observer } from 'mobx-react';

import {
  CHARLES_BLUE,
  MEDIA_MEDIUM,
  SERIF,
  Textarea,
} from '@cityofboston/react-fleet';

import { capitalize } from '../../lib/helpers';

import { CERTIFICATE_COST } from '../../lib/costs';

import CostSummary from './CostSummary';

import QuantityDropdown from './QuantityDropdown';
import BackButton from './question-components/BackButton';

import { THIN_BORDER_STYLE } from './question-components/styling';

interface Props {
  certificateType: 'birth' | 'marriage';
  certificateRequest: any;
  siteAnalytics?: any;
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
    const { certificateRequest, certificateType, siteAnalytics } = this.props;

    window.scroll(0, 0);

    if (certificateType === 'birth') {
      // // Since user has provided all needed information by this point, we
      // // will count this birth certificate as a trackable product.
      siteAnalytics.addProduct(
        '0',
        'Birth certificate',
        'Birth certificate',
        certificateRequest.quantity,
        CERTIFICATE_COST.BIRTH / 100
      );

      siteAnalytics.setProductAction('detail');
    }
  }

  private handleQuantityChange = (value: number | null) => {
    const { certificateRequest, certificateType, siteAnalytics } = this.props;

    const oldValue = certificateRequest.quantity;
    const newValue = value;

    if (newValue) {
      const difference = Math.abs(oldValue - newValue);

      if (certificateType === 'birth') {
        siteAnalytics.sendEvent('change certificate quantity', {
          category: 'Birth',
          label: oldValue > newValue ? 'decrease' : 'increase',
          value: oldValue > newValue ? -difference : difference,
        });
      }
      certificateRequest.setQuantity(newValue as number);
    }
  };

  // currently only used for Marriage (6/14 jm)
  private handleCustomerNotesChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    this.props.certificateRequest.answerQuestion({
      customerNotes: event.target.value,
    });
  };

  private userResetStartOver = () => {
    const { certificateType, siteAnalytics } = this.props;

    this.props.certificateRequest.clearCertificateRequest();

    if (certificateType === 'birth') {
      siteAnalytics.sendEvent('user reset', {
        category: 'Birth',
        label: 'start over',
      });
    }

    Router.push(`/${certificateType}`);
  };

  private returnToQuestions = () => {
    const { certificateRequest, certificateType, siteAnalytics } = this.props;

    const currentStepIndex = certificateRequest.steps.indexOf('reviewRequest');

    if (certificateType === 'birth') {
      siteAnalytics.addProduct(
        '0',
        'Birth certificate',
        'Birth certificate',
        certificateRequest.quantity,
        CERTIFICATE_COST.BIRTH / 100
      );

      siteAnalytics.setProductAction('remove');
    }

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
                : certificateRequest.fullNames}
            </div>

            <div css={CERTIFICATE_SUBINFO_STYLE}>
              <span>
                {capitalize(certificateType)} Certificate (Certified paper copy)
              </span>

              {certificateRequest.dateString ? (
                <span>
                  {certificateType === 'birth' &&
                    `Born: ${certificateRequest.dateString}`}
                  {certificateType === 'marriage' &&
                    `Date: ${certificateRequest.dateString}`}
                </span>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>

        <CostSummary
          certificateType="birth"
          certificateQuantity={quantity}
          allowServiceFeeTypeChoice
          serviceFeeType="CREDIT"
        />

        {certificateType === 'marriage' && (
          <Textarea
            name="customerNotes"
            label="Anything else you’d like us to know?"
            onChange={this.handleCustomerNotesChange}
          />
        )}

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
      </>
    );
  }
}

const CERTIFICATE_NAME_STYLE = css({
  fontStyle: 'normal',
  fontWeight: 'bold',
  letterSpacing: '1.4px',
});

const CERTIFICATE_INFO_BOX_STYLE = css({
  flex: 1,
  marginLeft: '1.25rem',
  [MEDIA_MEDIUM]: {
    marginLeft: '0.75rem',
  },
});

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
