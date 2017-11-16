// @flow

import React from 'react';
import Link from 'next/link';
import VelocityTransitionGroup from 'velocity-react/velocity-transition-group';
import { CERTIFICATE_COST, calculateCost } from '../../../lib/costs';

import type Cart from '../../store/Cart';

import {
  GRAY_000,
  CHARLES_BLUE,
  OPTIMISTIC_BLUE,
} from '../../common/style-constants';
import CertificateRow from '../../common/CertificateRow';

type Props = {|
  cart: Cart,
  defaultOpen: boolean,
|};

type State = {|
  open: boolean,
|};

export default class OrderDetails extends React.Component<Props, State> {
  static defaultProps = {
    defaultOpen: false,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      open: props.defaultOpen,
    };
  }

  toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };

  render() {
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
            <h2 className="t--sans tt-u">Order details</h2>
            <div className="t--info">
              {cart.size} {cart.size === 1 ? 'certificate' : 'certificates'} × ${(CERTIFICATE_COST / 100).toFixed(2)}{' '}
              + fee = ${(calculateCost(cart.size).total / 100).toFixed(2)}
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
              {cart.entries.map(
                ({ cert, quantity }, i) =>
                  cert && (
                    <CertificateRow
                      key={cert.id}
                      certificate={cert}
                      borderTop={i !== 0}
                      borderBottom={false}
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
              )}

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
            background-color: ${GRAY_000};
            margin-top: 0 !important;
          }

          .dr-h {
            padding: 0;
          }

          .dr--open .dr-h {
            background-color: ${GRAY_000};
            color: ${CHARLES_BLUE};
          }

          .dr--open .dr-i {
            fill: ${OPTIMISTIC_BLUE};
          }

          .dr-c {
            padding: 0;
          }
        `}</style>
      </div>
    );
  }
}
