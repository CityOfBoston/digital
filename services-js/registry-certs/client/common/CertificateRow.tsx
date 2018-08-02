import React from 'react';

import { DeathCertificate } from '../types';
import { CHARLES_BLUE } from './style-constants';

export interface Props {
  certificate: DeathCertificate;
  borderTop: boolean;
  borderBottom: boolean;
  children?: (
    renderedCertificate: React.ReactChild
  ) => React.ReactChild | Array<React.ReactChild>;
  thin?: boolean;
}

const renderCertificate = (
  { firstName, lastName, deathDate, deathYear, age, pending }: DeathCertificate,
  thin: boolean
) => (
  <div key="certificate" className="certificate-info-box">
    <div
      className={`t--sans m-v100 ${
        thin ? 'thin-certificate-name' : 'certificate-name'
      }`}
    >
      {firstName} {lastName}
      {pending && (
        <span style={{ color: CHARLES_BLUE }}>
          {' — '}
          <span
            className="t--sans tt-u"
            style={{ fontStyle: 'normal', fontWeight: 'bold' }}
          >
            pending
          </span>
        </span>
      )}
    </div>

    <div className="certificate-subinfo">
      Died: {deathDate || deathYear}
      {age && ` — Age: ${age}`}
    </div>

    <style jsx>{`
      .certificate-info-box {
        flex: 1;
      }

      .certificate-name {
        font-style: normal;
        font-weight: bold;
        letter-spacing: 1.4px;
      }

      .thin-certificate-name {
        font-style: normal;
      }

      .certificate-subinfo {
        color: #091f2f;
        font-style: italic;
      }
    `}</style>
  </div>
);

// This component takes an optional render prop as its child so that callers can
// construct their own rows. The function is given a <div> component for the
// certificate, and they can return it and other elements.

export default function CertificateRow({
  borderTop,
  borderBottom,
  certificate,
  children,
  thin,
}: Props) {
  let borderClass = '';

  if (!thin) {
    if (borderTop && borderBottom) {
      borderClass = 'br-a100';
    } else if (borderTop) {
      borderClass = 'br-t100';
    } else if (borderBottom) {
      borderClass = 'br-b100';
    }
  }

  return (
    <div className={`${thin ? 'p-v200' : 'p-v300'} br b--w row ${borderClass}`}>
      {children
        ? children(renderCertificate(certificate, !!thin))
        : renderCertificate(certificate, !!thin)}

      <style jsx>{`
        .row {
          border-color: #e0e0e0;
          border-left-width: 0;
          border-right-width: 0;

          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
