/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ReactChild } from 'react';

import { CHARLES_BLUE, GRAY_100 } from '@cityofboston/react-fleet';

import BirthCertificateRequest from '../store/BirthCertificateRequest';
import { DeathCertificate } from '../types';

export type Props = {
  borderTop: boolean;
  borderBottom: boolean;
  children?: (
    renderedCertificate: ReactChild
  ) => ReactChild | Array<ReactChild>;
  thin?: boolean;
} & (
  | {
      type: 'death';
      certificate: DeathCertificate;
    }
  | {
      type: 'birth';
      birthCertificateRequest: BirthCertificateRequest;
    });

type CertificateProps = {
  firstName: string;
  lastName: string;
  subinfo: string;
  pending: boolean;
  type: 'death' | 'birth';
};

const makeDeathSubinfo = ({
  deathDate,
  deathYear,
  age,
}: DeathCertificate): string =>
  `Died: ${deathDate || deathYear} ${age && ` — Age: ${age}`}`;

const makeBirthSubinfo = ({ birthDateString }): string =>
  `Born: ${birthDateString}`;

const renderCertificate = (
  { firstName, lastName, subinfo, pending, type }: CertificateProps,
  thin: boolean
) => (
  <div key="certificate" css={CERTIFICATE_INFO_BOX_STYLE}>
    <div
      className="t--sans m-v100"
      css={thin ? THIN_CERTIFICATE_NAME_STYLE : CERTIFICATE_NAME_STYLE}
    >
      {firstName} {lastName} {type === 'birth' && '(Certified paper copy)'}
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

    <div css={CERTIFICATE_SUBINFO_STYLE}>{subinfo}</div>
  </div>
);

// This component takes an optional render prop as its child so that callers can
// construct their own rows. The function is given a <div> component for the
// certificate, and they can return it and other elements.

export default function CertificateRow(props: Props) {
  const { borderTop, borderBottom, children: wrapperFunc, thin } = props;

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

  const certificateProps: CertificateProps =
    props.type === 'death'
      ? {
          firstName: props.certificate.firstName,
          lastName: props.certificate.lastName,
          subinfo: makeDeathSubinfo(props.certificate),
          pending: props.certificate.pending,
          type: 'death',
        }
      : {
          firstName: props.birthCertificateRequest.requestInformation.firstName,
          lastName: props.birthCertificateRequest.requestInformation.lastName,
          subinfo: makeBirthSubinfo(props.birthCertificateRequest),
          pending: false,
          type: 'birth',
        };

  return (
    <div
      className={`${thin ? 'p-v200' : 'p-v300'} br b--w ${borderClass}`}
      css={CERTIFICATE_ROW_STYLE}
    >
      {wrapperFunc
        ? wrapperFunc(renderCertificate(certificateProps, !!thin))
        : renderCertificate(certificateProps, !!thin)}
    </div>
  );
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
