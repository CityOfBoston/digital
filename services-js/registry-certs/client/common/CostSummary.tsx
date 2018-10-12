import React from 'react';
import { observer } from 'mobx-react';
import { css } from 'emotion';

import {
  calculateCreditCardCost,
  calculateDebitCardCost,
  CERTIFICATE_COST_STRING,
} from '../../lib/costs';

import DeathCertificateCart from '../store/DeathCertificateCart';

type ServiceFeeType = 'CREDIT' | 'DEBIT';

interface Props {
  cart: DeathCertificateCart;
  serviceFeeType: ServiceFeeType;
  allowServiceFeeTypeChoice?: boolean;
}

interface State {
  serviceFeeType: ServiceFeeType;
}

const CLEARFIX_STYLE = css({
  '&:after': {
    content: "''",
    display: 'table',
    clear: 'both',
  },
});

const COST_CELL_STYLE = css({
  width: '5em',
  verticalAlign: 'bottom',
  // Gives us even spacing for the rows
  lineHeight: 1.75,
});

const TOTAL_STYLE = css({
  padding: '0',
  lineHeight: 1,
  fontStyle: 'normal',
});

const TOTAL_TEXT_STYLE = css({
  // We want to re-use the responsive size from sh-title but be
  // a little bit smaller.
  fontSize: '80%',
});

const CARD_SELECT_STYLE = css({
  lineHeight: 1,
  display: 'inline-block',
});

const CARD_SELECT_FIELD_STYLE = css({
  height: '2rem',
  paddingRight: '3rem',
});

const CARD_SELECT_CONTAINER_STYLE = css({
  '&:after': {
    width: '2rem',
  },
});

// Component to display the subtotal / service fee / shipping / total UI from
// the cart and order review screens.
@observer
export default class CostSummary extends React.Component<Props, State> {
  static defaultProps = {
    allowServiceFeeTypeChoice: false,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      serviceFeeType: props.serviceFeeType,
    };
  }

  handleCardOptionChanged = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      serviceFeeType: ev.currentTarget.value as any,
    });
  };

  calculateCost() {
    const { cart } = this.props;
    const { serviceFeeType } = this.state;

    return serviceFeeType === 'CREDIT'
      ? calculateCreditCardCost(cart.size)
      : calculateDebitCardCost(cart.size);
  }

  render() {
    const { cart } = this.props;
    const { total, subtotal, serviceFee } = this.calculateCost();

    return (
      <div className={CLEARFIX_STYLE}>
        <table className="t--info ta-r" style={{ float: 'right' }}>
          <tbody>
            <tr>
              <td>
                {cart.size} {cart.size === 1 ? 'certificate' : 'certificates'} ×{' '}
                {CERTIFICATE_COST_STRING}
              </td>
              <td className={COST_CELL_STYLE}>
                ${(subtotal / 100).toFixed(2)}
              </td>
            </tr>

            <tr>
              <td>{this.renderServiceFeeLabel()}</td>
              <td className={COST_CELL_STYLE}>
                ${(serviceFee / 100).toFixed(2)}
              </td>
            </tr>

            <tr>
              <td>U.S. shipping included</td>
              <td className={COST_CELL_STYLE}>
                <i>$0.00</i>
              </td>
            </tr>

            <tr>
              <td className={`sh-title ${TOTAL_STYLE}`}>
                <span className={TOTAL_TEXT_STYLE}>Total</span>
              </td>
              <td className="cost-cell cost br br-t100 p-v200">
                ${(total / 100).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  renderServiceFeeLabel() {
    const { allowServiceFeeTypeChoice } = this.props;
    const { serviceFeeType } = this.state;

    if (allowServiceFeeTypeChoice) {
      return (
        <div>
          <div className={`sel sel--thin ${CARD_SELECT_STYLE}`}>
            <div className={`sel-c ${CARD_SELECT_CONTAINER_STYLE}`}>
              <select
                id="serviceFeeTypeSelect"
                className={`sel-f ${CARD_SELECT_FIELD_STYLE}`}
                onChange={this.handleCardOptionChanged}
                value={serviceFeeType}
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
