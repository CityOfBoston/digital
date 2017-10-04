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

        <div className="p-a300 cert" style={{ color: CHARLES_BLUE }}>
          <div
            aria-label="Quantity"
            className="t--sans"
            style={{ fontWeight: 'bold' }}
          >
            {quantity} ×
          </div>

          <CertificateRow
            certificate={certificate}
            borderTop={false}
            borderBottom={false}
          />
        </div>

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
        }

        .sh {
          border-bottom: none;
        }

        .cert {
          display: flex;
          align-items: center;
          padding-top: 0;
          padding-bottom: 0;
        }
      `}</style>
    </div>
  );
}
