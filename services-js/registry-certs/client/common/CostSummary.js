// @flow

import React from 'react';
import { observer } from 'mobx-react';

import {
  calculateCreditCardCost,
  calculateDebitCardCost,
  CERTIFICATE_COST_STRING,
} from '../../lib/costs';
import type Cart from '../store/Cart';

type ServiceFeeType = 'CREDIT' | 'DEBIT';

type Props = {
  cart: Cart,
  serviceFeeType: ServiceFeeType,
  allowServiceFeeTypeChoice: boolean,
};

type State = {
  serviceFeeType: ServiceFeeType,
};

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

  handleCardOptionChanged = (ev: SyntheticInputEvent<*>) => {
    this.setState({
      serviceFeeType: (ev.target.value: any),
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
    const { total, subtotal } = this.calculateCost();

    return (
      <div className="m-v500">
        <div className="p-v200">
          <div className="cost-row">
            <span className="t--info">
              {cart.size} {cart.size === 1 ? 'certificate' : 'certificates'} ×{' '}
              {CERTIFICATE_COST_STRING}
            </span>
            <span className="t--info cost">${(subtotal / 100).toFixed(2)}</span>
          </div>

          <div className="cost-row">{this.renderServiceFee()}</div>

          <div className="cost-row">
            <span className="t--info">Shipping within the U.S.</span>
            <span className="t--info cost">
              <i>included</i>
            </span>
          </div>
        </div>

        <div className="cost-row">
          <span className="sh-title">Total</span>
          <span className="cost br br-t100 p-v200">
            ${(total / 100).toFixed(2)}
          </span>
        </div>

        <style jsx>{`
          .cost-row {
            text-align: right;
          }

          .cost {
            min-width: 5em;
            margin-left: 1em;
            display: inline-block;
            color: #58585b;
          }

          .sh-title {
            padding: 0;
            line-height: 1;
          }
        `}</style>
      </div>
    );
  }

  renderServiceFee() {
    const { allowServiceFeeTypeChoice } = this.props;
    const { serviceFeeType } = this.state;

    let label;

    if (allowServiceFeeTypeChoice) {
      label = (
        <span className="t--info" key="label">
          <div className="sel sel--thin" style={{ display: 'inline-block' }}>
            <div className="sel-c">
              <select
                id="serviceFeeTypeSelect"
                className="sel-f"
                onChange={this.handleCardOptionChanged}
                value={serviceFeeType}
              >
                <option value="CREDIT">Credit card</option>
                <option value="DEBIT">Debit card</option>
              </select>
            </div>
          </div>{' '}
          <label htmlFor="serviceFeeTypeSelect">
            service fee
            <a href="#service-fee">*</a>
          </label>
          <style jsx>{`
            .sel--thin .sel-f {
              padding-top: 0;
              padding-bottom: 0;
            }
          `}</style>
        </span>
      );
    } else {
      switch (serviceFeeType) {
        case 'CREDIT':
          label = (
            <span className="t--info" key="label">
              Credit card service fee <a href="#service-fee">*</a>
            </span>
          );
          break;

        case 'DEBIT':
          label = (
            <span className="t--info" key="label">
              Debit card service fee <a href="#service-fee">*</a>
            </span>
          );
          break;

        default:
          throw new Error();
      }
    }

    const { serviceFee } = this.calculateCost();

    return [
      label,
      <span className="cost" key="value">
        ${(serviceFee / 100).toFixed(2)}
        <style jsx>{`
          .cost {
            min-width: 5em;
            margin-left: 1em;
            display: inline-block;
          }
        `}</style>
      </span>,
    ];
  }
}
