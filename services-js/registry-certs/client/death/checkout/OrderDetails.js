// @flow

import React from 'react';

import { CERTIFICATE_COST } from '../../store/Cart';
import type Cart from '../../store/Cart';

type Props = {|
  cart: Cart,
  open: boolean,
|};

type State = {|
  open: boolean,
|};

export default class OrderDetails extends React.Component<Props, State> {
  static defaultProps = {
    open: false,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      open: props.open,
    };
  }

  render() {
    const { cart } = this.props;
    const { open } = this.state;

    return (
      <div>
        <button
          className={`sel-c sel-c--fw ${open ? 'open' : ''}`}
          type="button"
        >
          <div className="sel-f">
            <div className="t--sans tt-u lnk">Order Details</div>
            <div className="t--info">
              {cart.size} {cart.size === 1 ? 'certificate' : 'certificates'} × ${CERTIFICATE_COST}{' '}
              + fee = ${cart.cost.toFixed(2)}
            </div>
          </div>
        </button>

        <style jsx>{`
          button {
            padding: 0;
            border-width: 0;
            font-size: inherit;
          }
          .sel-f {
            text-align: left;
            padding: 0.5rem;
          }
          .sel-c:after {
            background-image: url(https://patterns.boston.gov/images/global/icons/chevron-down.svg);
            transition: transform 250ms;
          }
          .sel-c.open:after {
            transform: rotateX(180deg);
          }
        `}</style>
      </div>
    );
  }
}
