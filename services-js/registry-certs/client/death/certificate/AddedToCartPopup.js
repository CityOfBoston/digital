// @flow

import React from 'react';
import Link from 'next/link';

import type { DeathCertificate } from '../../types';

import { GRAY_300 } from '../../common/style-constants';

type Props = {|
  certificate: DeathCertificate,
  quantity: number,
  close: () => mixed,
|};

export default function AddedToCartPopup({
  certificate: { firstName, lastName, id, deathDate, deathYear },
  quantity,
  close,
}: Props) {
  return (
    <div className="md-c">
      <button
        className="md-cb"
        type="button"
        style={{ border: 'none' }}
        onClick={close}
      >
        Close
      </button>
      <div className="mb-b p-a300 p-a600--xl">
        <div className="sh m-b500">
          <div className="sh-title">Added to Cart</div>
        </div>

        <div className="p-a300 result">
          <div aria-label="Quantity" className="p-a300">
            {quantity} ×
          </div>

          <div className="certificate-info">
            <div>
              {firstName} {lastName}
            </div>

            <div style={{ fontStyle: 'italic' }}>
              {deathDate || deathYear}
              <span className="id-label">ID:</span> {id}
            </div>
          </div>
        </div>

        <div className="m-v500 ta-c">
          <Link href="/death/cart">
            <a className="btn">Go to your cart</a>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .result {
          display: flex;
          align-items: center;
        }

        .certificate-info {
          flex: 1;
        }

        .id-label {
          color: ${GRAY_300};
          padding-left: 1em;
        }
      `}</style>
    </div>
  );
}
