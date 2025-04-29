/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent, Component } from 'react';

import {
  SANS,
  SERIF,
  CHARLES_BLUE,
  DEFAULT_TEXT,
  RegistryCCSelectDropDown,
} from '@cityofboston/react-fleet';

import {
  calculateCreditCardCost,
  calculateDebitCardCost,
  CERTIFICATE_COST,
  CERTIFICATE_COST_STRING,
} from '../../lib/costs';

import { CertificateType } from '../types';

type NewServiceFeeType = '-1' | '0' | '1';

interface Props {
  certificateType: CertificateType;
  certificateQuantity: number;
  allowServiceFeeTypeChoice?: boolean;
  hasResearchFee?: boolean;
  tracking?: boolean;
  newServiceFeeType?: NewServiceFeeType;
  setCardType?: (type: '-1' | '0' | '1') => void;
  getCardType?: any;
  useInDrawer?: boolean;
}

interface State {
  newServiceFeeType: NewServiceFeeType;
}

/**
 * Component to display the subtotal / service fees / shipping / total for an order.
 * Used in cart and order review screens for death certificates.
 * Used in information summary and order review screens for birth certificates.
 */
export default class CostSummary extends Component<Props, State> {
  static defaultProps = {
    allowServiceFeeTypeChoice: false,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      newServiceFeeType: props.newServiceFeeType || '0',
    };
  }

  handleCardOptChanged = (ev: ChangeEvent<HTMLSelectElement>) => {
    const newTypeVal = ev.currentTarget.value as NewServiceFeeType;

    this.setState({
      newServiceFeeType: newTypeVal,
    });
  };

  calculateCost() {
    const { certificateQuantity, hasResearchFee, tracking } = this.props;
    const { newServiceFeeType } = this.state;
    const certificateTypeCost =
      CERTIFICATE_COST[this.props.certificateType.toUpperCase()];

    return newServiceFeeType === '1'
      ? calculateCreditCardCost(
          certificateTypeCost,
          certificateQuantity,
          hasResearchFee,
          tracking
        )
      : calculateDebitCardCost(
          certificateTypeCost,
          certificateQuantity,
          hasResearchFee,
          tracking
        );
  }

  render() {
    const {
      certificateType,
      certificateQuantity,
      tracking,
      useInDrawer = false,
    } = this.props;
    const { total, subtotal, serviceFee, researchFee } = this.calculateCost();

    return (
      <>
        {$OrderSummary({
          certQuantityLabel: `Subtotal: ${certificateQuantity} ${
            certificateQuantity === 1 ? 'certificate' : 'certificates'
          } × ${CERTIFICATE_COST_STRING[certificateType.toUpperCase()]}`,
          totalCost: `${(subtotal / 100).toFixed(2)}`,
          researchFee: `${
            researchFee > 0 ? (researchFee / 100).toFixed(2) : ''
          }`,
          tracking: tracking,
          finalCost: `${(total / 100).toFixed(2)}`,
          onChangeHandler: this.handleCardOptChanged,
          serviceFeeType: this.state.newServiceFeeType,
          serviceFee: `${(serviceFee / 100).toFixed(2)}`,
          useInDrawer: useInDrawer,
        })}
      </>
    );
  }
}

export const $OrderSummary = (params: {
  certQuantityLabel: string;
  totalCost: string;
  researchFee: string;
  tracking?: boolean;
  finalCost?: string;
  onChangeHandler?: (ev: ChangeEvent<HTMLSelectElement>) => void;
  serviceFeeType?: string;
  serviceFee?: string;
  useInDrawer?: boolean;
}) => {
  const {
    certQuantityLabel,
    totalCost,
    researchFee,
    tracking = false,
    finalCost,
    serviceFeeType = '0',
    serviceFee,
    onChangeHandler,
    useInDrawer = false,
  } = params;

  return (
    <div css={ORDERSUMMARY}>
      {!useInDrawer && <h1>Order Summary</h1>}

      {certQuantityLabel && totalCost && (
        <div className={'row'}>
          <div className={'col'}>{certQuantityLabel}</div>
          <div className={'col'}>${totalCost}</div>
        </div>
      )}

      {researchFee && (
        <div className={'row'}>
          <div className="col">Research fee</div>
          <div className="col">{researchFee}</div>
        </div>
      )}

      <div className={'row'}>
        <div className={'col'}>US Shipping</div>
        <div className={'col'}>FREE</div>
      </div>

      {tracking === true && (
        <div className={'row'}>
          <div className={'col'}>USPS Tracking®</div>
          <div className={'col'}>$ 5.00</div>
        </div>
      )}

      {onChangeHandler && useInDrawer === false && (
        <div className={'row'}>
          <div className={'col'}>
            <RegistryCCSelectDropDown
              id="ServiceFeeTypeSelect"
              value={serviceFeeType}
              label={'Service fee'}
              options={[
                { value: '-1', label: 'Select card' },
                { value: '0', label: 'credit card' },
                { value: '1', label: 'debit card' },
              ]}
              onChange={onChangeHandler}
            />
          </div>
          <div className={'col'}>$ {serviceFee}</div>
        </div>
      )}

      {useInDrawer === true && (
        <div className={'row'}>
          <div className={'col'}>Service fee</div>
          <div className={'col'}>$ {serviceFee}</div>
        </div>
      )}

      <div className={'row'}>
        <div className={'col'}>Total</div>
        <div className={'col'}>$ {finalCost}</div>
      </div>
    </div>
  );
};

const ORDERSUMMARY = css`
  color: ${CHARLES_BLUE};
  font-family: ${SERIF};
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  margin: auto;
  min-width: 320px;

  h1 {
    font-family: ${SANS};
    font-weight: 700;
    font-size: 18px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  span.bold {
    font-weight: 700;
  }

  .row {
    display: flex;
    align-items: baseline;
    margin-bottom: 12px;
    // background: orange;

    .col {
      flex-grow: 1;
    }

    .col:nth-of-type(2) {
      text-align: right;
    }

    &:nth-last-of-type(-n + 1) {
      font-family: ${SANS};
      font-size: 24px;
      font-weight: 700;
      text-transform: uppercase;

      border-top: 1px solid ${DEFAULT_TEXT};
      padding-top: 16px;
      margin-top: 16px;
    }
  }
`;
