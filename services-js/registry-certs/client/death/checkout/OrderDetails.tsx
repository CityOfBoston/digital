import React from 'react';
import Link from 'next/link';
import VelocityTransitionGroup from 'velocity-react/velocity-transition-group';
import {
  CERTIFICATE_COST_STRING,
  PERCENTAGE_CC_STRING,
  FIXED_CC_STRING,
  calculateCreditCardCost,
  SERVICE_FEE_URI,
} from '../../../lib/costs';

import Cart from '../../store/Cart';

import CertificateRow from '../../common/CertificateRow';

interface Props {
  cart: Cart;
  defaultOpen?: boolean;
  fixed?: boolean;
}

interface State {
  open: boolean;
}

export default class OrderDetails extends React.Component<Props, State> {
  static defaultProps = {
    defaultOpen: false,
    fixed: false,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      open: props.defaultOpen || !!props.fixed,
    };
  }

  toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };

  render() {
    const { fixed } = this.props;

    return fixed ? this.renderAsFixed() : this.renderAsDropdown();
  }

  renderCart(cart: Cart, thin: boolean) {
    return cart.entries.map(
      ({ cert, quantity }, i) =>
        cert && (
          <CertificateRow
            key={cert.id}
            certificate={cert}
            borderTop={i !== 0}
            borderBottom={i === cart.entries.length - 1}
            thin={thin}
          >
            {certificateDiv => [
              <div
                key="quantity"
                aria-label="Quantity"
                className="t--sans p-a300"
                style={{ fontWeight: 'bold' }}
              >
                {quantity} ×
              </div>,

              certificateDiv,
            ]}
          </CertificateRow>
        )
    );
  }

  renderAsDropdown() {
    const { cart } = this.props;
    const { open } = this.state;

    return (
      <div className={`dr ${open ? 'dr--open' : ''}`}>
        <button
          className="dr-h"
          type="button"
          onClick={this.toggleOpen}
          aria-expanded={open}
        >
          <div className="p-a300">
            <div className="dr-ic">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 8.5 18 25">
                <path
                  className="dr-i"
                  d="M16 21L.5 33.2c-.6.5-1.5.4-2.2-.2-.5-.6-.4-1.6.2-2l12.6-10-12.6-10c-.6-.5-.7-1.5-.2-2s1.5-.7 2.2-.2L16 21z"
                />
              </svg>
            </div>
            <h2 className="stp">Order details</h2>
            <div className="t--info">
              {cart.size} {cart.size === 1 ? 'item' : 'items'} ×{' '}
              {CERTIFICATE_COST_STRING} = ${(
                calculateCreditCardCost(cart.size).subtotal / 100
              ).toFixed(2)}{' '}
              + service fee*
            </div>
          </div>
        </button>

        <VelocityTransitionGroup
          enter={{ animation: 'slideDown', duration: 250 }}
          leave={{ animation: 'slideUp', duration: 250 }}
          role="region"
        >
          {open && (
            <div className="dr-c" style={{ display: 'block' }}>
              {this.renderCart(cart, false)}

              <div className="t--subinfo p-a300">
                * You are charged an extra service fee of not more than{' '}
                {FIXED_CC_STRING} plus {PERCENTAGE_CC_STRING}. This fee goes
                directly to a third party to pay for the cost of card
                processing. Learn more about{' '}
                <a href={SERVICE_FEE_URI}>card service fees</a> at the City of
                Boston.
              </div>

              <div className="ta-c t--subinfo b--g">
                <Link href="/death/cart">
                  <a style={{ display: 'block', padding: '0.5em' }}>
                    edit cart
                  </a>
                </Link>
              </div>
            </div>
          )}
        </VelocityTransitionGroup>

        <style jsx>{`
          .dr {
            background-color: #f3f3f3;
            margin-top: 0 !important;
          }

          .dr-h {
            padding: 0;
          }

          .dr--open .dr-h {
            background-color: #f3f3f3;
            color: #091f2f;
          }

          .dr--open .dr-i {
            fill: #288be4;
          }

          .dr-c {
            padding: 0;
          }
        `}</style>
      </div>
    );
  }

  renderAsFixed() {
    const { cart } = this.props;

    return (
      <div className="m-v700">
        <div className="fs-l">
          <div className="fs-l-c">
            Order details
            <span className="t--reset">
              &nbsp;—&nbsp;
              <span className="t--subinfo">
                <Link href="/death/cart">
                  <a aria-label="Edit order details">edit</a>
                </Link>
              </span>
            </span>
          </div>
        </div>

        {this.renderCart(cart, true)}
      </div>
    );
  }
}
