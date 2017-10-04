// @flow

import React from 'react';

import type { DeathCertificate } from '../types';
import { GRAY_100, CHARLES_BLUE } from './style-constants';

export type Props = {|
  certificate: DeathCertificate,
  borderTop: boolean,
  borderBottom: boolean,
|};

export default function SearchResult({
  borderTop,
  borderBottom,
  certificate: { firstName, lastName, deathDate, deathYear, pending },
}: Props) {
  let borderClass;

  if (borderTop && borderBottom) {
    borderClass = 'br-a100';
  } else if (borderTop) {
    borderClass = 'br-t100';
  } else if (borderBottom) {
    borderClass = 'br-b100';
  } else {
    borderClass = '';
  }

  return (
    <div className={`p-a300 br b--w row ${borderClass}`}>
      <div
        className="t--sans"
        style={{
          fontStyle: 'normal',
          fontWeight: 'bold',
          letterSpacing: 1.4,
        }}
      >
        {firstName} {lastName}
      </div>

      <div style={{ color: CHARLES_BLUE }}>
        Died: {deathDate || deathYear}
        {pending && ' – Certificate pending'}
      </div>
      <style jsx>{`
        .row {
          display: block;
          font-style: italic;
          border-color: ${GRAY_100};
          border-left-width: 0;
          border-right-width: 0;
        }
      `}</style>
    </div>
  );
}
