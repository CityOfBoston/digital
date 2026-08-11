/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent, Component } from 'react';

import {
  SANS,
  SERIF,
  CHARLES_BLUE,
  DEFAULT_TEXT,
  ERROR_BORDER_COLOR,
  RegistryCCSelectDropDown,
  MEDIA_SMALL_MAX,
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
  setCardType?: any;
  useInDrawer?: boolean;
  /** Shown under the service fee dropdown when validation fails. */
  serviceFeeError?: string | null;
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
      newServiceFeeType: props.newServiceFeeType ?? '-1',
    };
  }

  componentDidMount() {
    this.setState({
      newServiceFeeType: this.props.newServiceFeeType ?? '-1',
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.newServiceFeeType !== this.props.newServiceFeeType) {
      this.setState({
        newServiceFeeType: this.props.newServiceFeeType ?? '-1',
      });
    }
  }

  handleCardOptChanged = (ev: ChangeEvent<HTMLSelectElement>) => {
    const { setCardType } = this.props;
    const value = ev.currentTarget.value as NewServiceFeeType;
    if (setCardType) {
      setCardType(value);
    }

    this.setState({
      newServiceFeeType: value,
    });
  };

  calculateCost() {
    const { certificateQuantity, hasResearchFee, tracking } = this.props;
    const { newServiceFeeType } = this.state;
    const certificateTypeCost =
      CERTIFICATE_COST[this.props.certificateType.toUpperCase()];

    if (newServiceFeeType === '-1') {
      const subtotalOnly = calculateDebitCardCost(
        certificateTypeCost,
        certificateQuantity,
        hasResearchFee,
        tracking
      );
      return {
        ...subtotalOnly,
        serviceFee: 0,
        total: 0,
        serviceFeeUnset: true as const,
      };
    }

    return newServiceFeeType === '0'
      ? {
          ...calculateCreditCardCost(
            certificateTypeCost,
            certificateQuantity,
            hasResearchFee,
            tracking
          ),
          serviceFeeUnset: false as const,
        }
      : {
          ...calculateDebitCardCost(
            certificateTypeCost,
            certificateQuantity,
            hasResearchFee,
            tracking
          ),
          serviceFeeUnset: false as const,
        };
  }

  render() {
    const {
      certificateType,
      certificateQuantity,
      tracking,
      useInDrawer = false,
      serviceFeeError,
    } = this.props;
    const { total, subtotal, serviceFee, researchFee, serviceFeeUnset } =
      this.calculateCost();

    const serviceFeeDisplay = serviceFeeUnset
      ? 'N/A'
      : `$${(serviceFee / 100).toFixed(2)}`;
    const totalDisplay = serviceFeeUnset
      ? 'N/A'
      : `$${(total / 100).toFixed(2)}`;

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
          finalCost: totalDisplay,
          onChangeHandler: this.handleCardOptChanged,
          serviceFeeType: this.state.newServiceFeeType,
          serviceFee: serviceFeeDisplay,
          useInDrawer: useInDrawer,
          serviceFeeError: serviceFeeError,
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
  /** Preformatted total, including leading $ or “N/A”. */
  finalCost?: string;
  onChangeHandler?: (ev: ChangeEvent<HTMLSelectElement>) => void;
  serviceFeeType?: string;
  /** Preformatted service fee, including leading $ or “N/A”. */
  serviceFee?: string;
  useInDrawer?: boolean;
  serviceFeeError?: string | null;
}) => {
  const {
    certQuantityLabel,
    totalCost,
    researchFee,
    tracking = false,
    finalCost,
    serviceFeeType = '-1',
    serviceFee,
    onChangeHandler,
    useInDrawer = false,
    serviceFeeError,
  } = params;

  return (
    <div css={ORDERSUMMARY}>
      {!useInDrawer && <h1>Order Summary</h1>}

      {certQuantityLabel && totalCost && (
        <div className={'row'}>
          <div className={'col'}>{certQuantityLabel}</div>
          <div className={'col amount'}>${totalCost}</div>
        </div>
      )}

      {researchFee && (
        <div className={'row'}>
          <div className="col">Research fee</div>
          <div className="col amount">{researchFee}</div>
        </div>
      )}

      <div className={'row'}>
        <div className={'col'}>US Shipping</div>
        <div className={'col amount'}>FREE</div>
      </div>

      {tracking === true && (
        <div className={'row'}>
          <div className={'col'}>USPS Tracking®</div>
          <div className={'col amount'}>$5.00</div>
        </div>
      )}

      {onChangeHandler && useInDrawer === false && (
        <div
          className={'row'}
          css={serviceFeeError ? SERVICE_FEE_ERROR_ROW_STYLING : undefined}
        >
          <div className={'col'}>
            <RegistryCCSelectDropDown
              id="ServiceFeeTypeSelect"
              value={serviceFeeType}
              label={'Service fee'}
              placeholder="Select an Option"
              placeholderValue="-1"
              options={[
                { value: '0', label: 'credit card' },
                { value: '1', label: 'debit card' },
              ]}
              onChange={onChangeHandler}
            />
            {serviceFeeError && (
              <div
                className="t--info t--err m-t200"
                id="ServiceFeeTypeSelect-error"
                role="alert"
              >
                {serviceFeeError}
              </div>
            )}
          </div>
          <div className={'col amount'}>{serviceFee}</div>
        </div>
      )}

      {useInDrawer === true && (
        <div className={'row'}>
          <div className={'col'}>Service fee</div>
          <div className={'col amount'}>{serviceFee}</div>
        </div>
      )}

      <div className={'row'}>
        <div className={'col'}>Total</div>
        <div className={'col amount total-cost'}>{finalCost}</div>
      </div>
    </div>
  );
};

const SERVICE_FEE_ERROR_ROW_STYLING = css({
  alignItems: 'flex-start',

  '.labeled-select select': {
    outline: `2px solid ${ERROR_BORDER_COLOR}`,
    outlineOffset: '2px',
  },
});

const ORDERSUMMARY = css`
  color: ${CHARLES_BLUE};
  font-family: ${SERIF};
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  margin: auto;
  width: 100%;

  h1 {
    font-family: ${SANS};
    font-weight: 700;
    font-size: 18px;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  span.bold {
    font-weight: 700;
  }

  .row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    line-height: 1.5;
    min-height: 1.5rem;
    overflow: visible;

    .col {
      flex: 1 1 auto;
      min-width: 0;
      overflow: visible;
    }

    .col.amount {
      flex: 0 0 auto;
      text-align: right;
      white-space: nowrap;
    }

    /* Service fee select — shrink to selected label; don’t clip caret/text */
    .labeled-select {
      overflow: visible;
      line-height: 1.5;
      width: auto;
      max-width: 100%;

      label {
        line-height: 1.5;
        flex-shrink: 0;
      }

      .select--wrapper {
        overflow: visible;
        flex: 0 1 auto;
        min-width: 0;
      }

      select {
        height: auto;
        min-height: 1.5rem;
        line-height: 1.5;
        padding-top: 0.125rem;
        padding-bottom: 0.125rem;
        box-sizing: content-box;
      }
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

  ${MEDIA_SMALL_MAX} {
    .total-cost {
      font-size: 24px;
    }
  }
`;
