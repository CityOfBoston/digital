import React from 'react';
import Link from 'next/link';

import { DeathCertificate } from '../../types';

import CertificateRow from '../../common/CertificateRow';

export interface Props {
  certificate: DeathCertificate;
  backUrl: string;
}

export default function SearchResult({ backUrl, certificate }: Props) {
  const { id } = certificate;

  return (
    <Link
      href={`/death/certificate?id=${id}&backUrl=${encodeURIComponent(
        backUrl
      )}`}
      prefetch={process.env.NODE_ENV !== 'test'}
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
