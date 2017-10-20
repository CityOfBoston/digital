// @flow

import React from 'react';

import { CERTIFICATE_COST, PROCESSING_FEE } from '../store/Cart';
import type Cart from '../store/Cart';

type Props = {
  cart: Cart,
};

export default function CostSummary({ cart }: Props) {
  const certificateCost = cart.size * CERTIFICATE_COST;
  const processingFee = PROCESSING_FEE * certificateCost;

  return (
    <div className="m-v500">
      <div className="p-v200">
        <div className="cost-row">
          <span className="t--info">
            {cart.size} {cart.size === 1 ? 'certificate' : 'certificates'} × ${CERTIFICATE_COST}
          </span>
          <span className="cost">${certificateCost.toFixed(2)}</span>
        </div>

        <div className="cost-row">
          <span className="t--info">Credit card processing fee</span>
          <span className="cost">${processingFee.toFixed(2)}</span>
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
        <span className="cost br br-t100 p-v200">${cart.cost.toFixed(2)}</span>
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
