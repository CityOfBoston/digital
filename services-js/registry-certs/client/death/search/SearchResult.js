// @flow

import React from 'react';
import Link from 'next/link';

import type { DeathCertificate } from '../../types';

import CertificateRow from '../../common/CertificateRow';

export type Props = {|
  certificate: DeathCertificate,
  backUrl: string,
|};

export default function SearchResult({ backUrl, certificate }: Props) {
  const { id } = certificate;

  return (
    <Link
      href={`/death/certificate?id=${id}&backUrl=${encodeURIComponent(
        backUrl
      )}`}
      as={`/death/certificate/${id}`}
    >
      <a>
        <CertificateRow
          certificate={certificate}
          borderTop={false}
          borderBottom={true}
        />
      </a>
    </Link>
  );
}
