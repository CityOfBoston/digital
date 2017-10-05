// @flow

import React from 'react';
import Link from 'next/link';

import type { DeathCertificate } from '../../types';

import { CHARLES_BLUE } from '../../common/style-constants';
import CertificateRow from '../../common/CertificateRow';

type Props = {|
  certificate: DeathCertificate,
  quantity: number,
  close: () => mixed,
|};

export default function AddedToCartPopup({
  certificate,
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
        <div className="sh m-b300">
          <div className="sh-title">Added to Cart</div>
        </div>

        <CertificateRow
          certificate={certificate}
          borderTop={false}
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

        <div className="m-v500 ta-c">
          <Link href="/death/cart">
            <a className="btn">Go to your cart</a>
          </Link>
        </div>

        <div className="m-t500">
          <Link href="/death">
            <a>← Start new search</a>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .md-c {
          padding-top: 0;
          color: ${CHARLES_BLUE};
        }

        .sh {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}
