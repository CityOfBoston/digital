/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent, Component } from 'react';

import {
  // VISUALLY_HIDDEN,
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

type ServiceFeeType = 'CREDIT' | 'DEBIT';
type NewServiceFeeType = '-1' | '0' | '1';

interface Props {
  certificateType: CertificateType;
  certificateQuantity: number;
  serviceFeeType: ServiceFeeType;
  allowServiceFeeTypeChoice?: boolean;
  hasResearchFee?: boolean;
  tracking?: boolean;
  newServiceFeeType?: NewServiceFeeType;
}

interface State {
  serviceFeeType: ServiceFeeType;
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
      serviceFeeType: props.serviceFeeType,
      newServiceFeeType: props.newServiceFeeType || '-1',
    };
  }

  handleCardOptionChanged = (ev: ChangeEvent<HTMLSelectElement>) => {
    const value = ev.currentTarget.value;
    // let newServiceVal = '-1';
    // let serviceFeeTypeVal = 'CREDIT';

    // if (value === 'CREDIT') newServiceVal = '0';
    // if (value === 'DEBIT') newServiceVal = '1';

    // // if (value === '-1') serviceFeeTypeVal = 'CREDIT';
    // // if (value === '0') serviceFeeTypeVal = 'CREDIT';
    // if (value === '1') serviceFeeTypeVal = 'DEBIT';

    // console.log(
    //   `handleCardOptionChanged > value: ${value} | serviceFeeType: ${
    //     this.state.serviceFeeType
    //   } | newServiceFeeType: ${
    //     this.state.newServiceFeeType
    //   } | newServiceVal: ${newServiceVal}`
    // );

    this.setState({
      serviceFeeType: value as ServiceFeeType,
      // serviceFeeType: serviceFeeTypeVal as ServiceFeeType,
      // newServiceFeeType: newServiceVal as NewServiceFeeType,
    });
  };

  handleCardOptChanged = (ev: ChangeEvent<HTMLSelectElement>) => {
    // console.log(
    //   `handleCardOptChanged > value: ${
    //     ev.currentTarget.value
    //   } | serviceFeeType: ${this.state.serviceFeeType} | newServiceFeeType: ${
    //     this.state.newServiceFeeType
    //   }`
    // );
    this.setState({
      newServiceFeeType: ev.currentTarget.value as NewServiceFeeType,
    });
  };

  calculateCost() {
    const { certificateQuantity, hasResearchFee, tracking } = this.props;
    const {
      // serviceFeeType,
      newServiceFeeType,
    } = this.state;
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
    const { certificateType, certificateQuantity, tracking } = this.props;
    const { total, subtotal, serviceFee, researchFee } = this.calculateCost();

    // const oldCostSummary = () => {
    //   return (
    //     <div css={CLEARFIX_STYLE}>
    //       <table className="t--info ta-r" style={{ float: 'right' }}>
    //         <caption css={VISUALLY_HIDDEN}>Cost Summary</caption>
    //         <thead css={VISUALLY_HIDDEN}>
    //           <tr>
    //             <th scope="col">Item</th>
    //             <th scope="col">Amount</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           <tr>
    //             <td>
    //               {certificateQuantity}{' '}
    //               {certificateQuantity === 1 ? 'certificate' : 'certificates'} ×{' '}
    //               {CERTIFICATE_COST_STRING[certificateType.toUpperCase()]}
    //             </td>
    //             <td css={COST_CELL_STYLE}>${(subtotal / 100).toFixed(2)}</td>
    //           </tr>

    //           {/* todo: add hyperlinked asterisk to explain to user why research fee was applied */}
    //           {/* Per-transaction fee for records dated before 1870. */}
    //           {researchFee > 0 && (
    //             <tr>
    //               <td>Research fee</td>
    //               <td css={COST_CELL_STYLE}>
    //                 ${(researchFee / 100).toFixed(2)}
    //               </td>
    //             </tr>
    //           )}

    //           <tr>
    //             <td>{this.renderServiceFeeLabel()}</td>
    //             <td css={COST_CELL_STYLE}>${(serviceFee / 100).toFixed(2)}</td>
    //           </tr>

    //           <tr>
    //             <td>U.S. shipping included</td>
    //             <td css={COST_CELL_STYLE}>
    //               <i>$0.00</i>
    //             </td>
    //           </tr>

    //           <tr>
    //             <td className="sh-title" css={TOTAL_STYLE}>
    //               <span css={TOTAL_TEXT_STYLE}>Total</span>
    //             </td>
    //             <td className="cost-cell cost br br-t100 p-v200">
    //               ${(total / 100).toFixed(2)}
    //             </td>
    //           </tr>
    //         </tbody>
    //       </table>
    //     </div>
    //   );
    // };

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
        })}

        {/* {oldCostSummary()} */}
      </>
    );
  }

  renderServiceFeeLabel() {
    const { allowServiceFeeTypeChoice } = this.props;
    const { serviceFeeType } = this.state;

    if (allowServiceFeeTypeChoice) {
      return (
        <div>
          <div className="sel sel--thin" css={CARD_SELECT_STYLE}>
            <div className="sel-c " css={CARD_SELECT_CONTAINER_STYLE}>
              <select
                id="serviceFeeTypeSelect"
                value={serviceFeeType}
                className="sel-f"
                css={CARD_SELECT_FIELD_STYLE}
                onChange={this.handleCardOptionChanged}
                aria-label="Payment type"
              >
                <option value="CREDIT">Credit card</option>
                <option value="DEBIT">Debit card</option>
              </select>
            </div>
          </div>{' '}
          service fee{' '}
          <a href="#service-fee" aria-label="About the service fee">
            *
          </a>
        </div>
      );
    } else {
      switch (serviceFeeType) {
        case 'CREDIT':
          return (
            <span>
              Credit card service fee <a href="#service-fee">*</a>
            </span>
          );

        case 'DEBIT':
          return (
            <span>
              Debit card service fee <a href="#service-fee">*</a>
            </span>
          );

        default:
          throw new Error();
      }
    }
  }
}

const $OrderSummary = (params: {
  certQuantityLabel: string;
  totalCost: string;
  researchFee: string;
  tracking?: boolean;
  finalCost?: string;
  onChangeHandler?: (ev: ChangeEvent<HTMLSelectElement>) => void;
  serviceFeeType?: string;
  serviceFee?: string;
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
  } = params;

  return (
    <div css={ORDERSUMMARY}>
      <h1>Order Summary</h1>

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

      {tracking === true && (
        <div className={'row'}>
          <div className={'col'}>
            <span className={`bold`}>USPS Tracking®</span>
          </div>
          <div className={'col'}>$ 5.00</div>
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

// const CLEARFIX_STYLE = css({
//   '&:after': {
//     content: "''",
//     display: 'table',
//     clear: 'both',
//   },
// });

// const COST_CELL_STYLE = css({
//   width: '5em',
//   verticalAlign: 'bottom',
//   // Gives us even spacing for the rows
//   lineHeight: 1.75,
// });

// const TOTAL_STYLE = css({
//   padding: '0',
//   lineHeight: 1,
//   fontStyle: 'normal',
// });

// const TOTAL_TEXT_STYLE = css({
//   // We want to re-use the responsive size from sh-title but be
//   // a little bit smaller.
//   fontSize: '80%',
// });

const CARD_SELECT_STYLE = css({
  lineHeight: 1,
  display: 'inline-block',
});

const CARD_SELECT_FIELD_STYLE = css({
  height: '2rem',
  lineHeight: 'initial',
  paddingRight: '3rem',
});

const CARD_SELECT_CONTAINER_STYLE = css({
  '&:after': {
    width: '2rem',
  },
});
