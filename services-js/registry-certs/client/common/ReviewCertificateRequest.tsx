/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { /* ChangeEvent, */ Component, ReactChild } from 'react';

import Router from 'next/router';

import { observer } from 'mobx-react';

import {
  CHARLES_BLUE,
  SERIF,
  // MEDIA_MEDIUM,
  // Textarea,
} from '@cityofboston/react-fleet';
// import { capitalize } from '../../lib/helpers';

import { CERTIFICATE_COST } from '../../lib/costs';

import CostSummary from './CostSummary';
import { OrderDetails } from './checkout/OrderDetails';
import { CARDTYPE } from '../models/CardType';

// import QuantityDropdown from './QuantityDropdown';
import BackButton from './question-components/BackButton';

// import { THIN_BORDER_STYLE } from './question-components/styling';

interface Props {
  certificateType: 'birth' | 'marriage' | 'intention';
  certificateRequest: any;
  siteAnalytics?: any;
  children: ReactChild | ReactChild[];
  tracking?: boolean;
  cardType?: CARDTYPE;
  cardTypeChangeHandler?: (type: CARDTYPE) => void;
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
    const {
      certificateRequest,
      certificateType,
      tracking,
      cardType,
      cardTypeChangeHandler,
    } = this.props;
    const { quantity } = certificateRequest;

    const entry = () => {
      if (certificateType === 'birth') {
        return (
          <div css={ENTRIES_CSS}>
            <div className={'certRow'}>
              <OrderDetails
                type="birth"
                birthCertificateRequest={this.props.certificateRequest}
              />
            </div>
          </div>
        );
      } else {
        return (
          <div css={ENTRIES_CSS}>
            <div className={'certRow'}>
              <OrderDetails
                type="marriage"
                marriageCertificateRequest={this.props.certificateRequest}
              />
            </div>
          </div>
        );
      }
    };

    return (
      <>
        {this.props.children}

        {entry()}

        <CostSummary
          certificateType="birth"
          certificateQuantity={quantity}
          allowServiceFeeTypeChoice
          newServiceFeeType={cardType}
          tracking={tracking}
          setCardType={cardTypeChangeHandler}
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
      </>
    );
  }
}

const ENTRIES_CSS = css`
  .certRow {
    color: ${CHARLES_BLUE};
    font-family: ${SERIF};
    margin-bottom: 1.5rem;
  }
`;
