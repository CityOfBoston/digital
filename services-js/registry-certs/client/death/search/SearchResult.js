// @flow

import React from 'react';
import Link from 'next/link';

import type { DeathCertificate } from '../../types';
import { GRAY_100 } from '../../common/style-constants';

export type Props = {|
  certificate: DeathCertificate,
  backUrl: string,
|};

export default function SearchResult({
  backUrl,
  certificate: { firstName, lastName, age, deathDate, deathYear, id, pending },
}: Props) {
  return (
    <Link
      href={`/death/certificate?id=${id}&backUrl=${encodeURIComponent(
        backUrl
      )}`}
      as={`/death/certificate/${id}`}
    >
      <a className={'p-a300 br br-t100 b--w result'}>
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
        <div>
          Died: {deathDate || deathYear} ({age})
        </div>
        {pending && <div>Certificate Pending</div>}
        <style jsx>{`
          .result {
            display: block;
            color: inherit;
            font-style: italic;
            border-color: ${GRAY_100};
          }
        `}</style>
      </a>
    </Link>
  );
}
