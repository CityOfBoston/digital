import React from 'react';

import { DeathCertificate } from '../types';
import { css } from 'emotion';
import { CHARLES_BLUE, GRAY_100 } from './style-constants';

export interface Props {
  certificate: DeathCertificate;
  borderTop: boolean;
  borderBottom: boolean;
  children?: (
    renderedCertificate: React.ReactChild
  ) => React.ReactChild | Array<React.ReactChild>;
  thin?: boolean;
}

const CERTIFICATE_INFO_BOX_STYLE = css({ flex: 1 });

const CERTIFICATE_NAME_STYLE = css({
  fontStyle: 'normal',
  fontWeight: 'bold',
  letterSpacing: '1.4px',
});

const THIN_CERTIFICATE_NAME_STYLE = css({
  fontStyle: 'normal',
});

const CERTIFICATE_SUBINFO_STYLE = css({
  color: CHARLES_BLUE,
  fontStyle: 'italic',
});

const CERTIFICATE_ROW_STYLE = css({
  borderColor: GRAY_100,
  borderLeftWidth: 0,
  borderRightWidth: 0,

  display: 'flex',
  alignItems: 'center',
});

const renderCertificate = (
  { firstName, lastName, deathDate, deathYear, age, pending }: DeathCertificate,
  thin: boolean
) => (
  <div key="certificate" className={CERTIFICATE_INFO_BOX_STYLE}>
    <div
      className={`t--sans m-v100 ${
        thin ? THIN_CERTIFICATE_NAME_STYLE : CERTIFICATE_NAME_STYLE
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

    <div className={CERTIFICATE_SUBINFO_STYLE}>
      Died: {deathDate || deathYear}
      {age && ` — Age: ${age}`}
    </div>
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
    <div
      className={`${
        thin ? 'p-v200' : 'p-v300'
      } br b--w ${CERTIFICATE_ROW_STYLE} ${borderClass}`}
    >
      {children
        ? children(renderCertificate(certificate, !!thin))
        : renderCertificate(certificate, !!thin)}
    </div>
  );
}
