// @flow

import React from 'react';

import { calculateCost, CERTIFICATE_COST } from '../../lib/costs';
import type Cart from '../store/Cart';

type Props = {
  cart: Cart,
};

export default function CostSummary({ cart }: Props) {
  const { total, subtotal, serviceFee } = calculateCost(cart.size);

  return (
    <div className="m-v500">
      <div className="p-v200">
        <div className="cost-row">
          <span className="t--info">
            {cart.size} {cart.size === 1 ? 'certificate' : 'certificates'} × ${(CERTIFICATE_COST / 100).toFixed()}
          </span>
          <span className="cost">${(subtotal / 100).toFixed(2)}</span>
        </div>

        <div className="cost-row">
          <span className="t--info">Credit card processing fee</span>
          <span className="cost">${(serviceFee / 100).toFixed(2)}</span>
        </div>

        <div className="cost-row">
          <span className="t--info">Shipping within the U.S.</span>
          <span className="cost">
            <i>free</i>
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
        }

        .sh-title {
          padding: 0;
          line-height: 1;
        }
      `}</style>
    </div>
  );
}
