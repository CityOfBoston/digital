/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ReactChild } from 'react';

import { CHARLES_BLUE, GRAY_100 } from '@cityofboston/react-fleet';

import BirthCertificateRequest from '../store/BirthCertificateRequest';
import MarriageCertificateRequest from '../store/MarriageCertificateRequest';

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
      certificate: BirthCertificateRequest;
    }
  | {
      type: 'marriage';
      certificate: MarriageCertificateRequest;
    });

type CertificateProps = {
  subinfo: string;
  pending: boolean;
} & (
  | {
      type: 'death';
      firstName: string;
      lastName: string;
    }
  | {
      type: 'birth';
      firstName: string;
      lastName: string;
    }
  | {
      type: 'marriage';
      fullNames: string;
    });

const renderCertificate = (
  certificateProps: CertificateProps,
  thin: boolean
) => (
  <div key="certificate" css={CERTIFICATE_INFO_BOX_STYLE}>
    <div
      className="t--sans m-v100"
      css={thin ? THIN_CERTIFICATE_NAME_STYLE : CERTIFICATE_NAME_STYLE}
    >
      {certificateProps.type === 'marriage' ? (
        <span css={LONG_TEXT_STYLE}>
          <span>{certificateProps.fullNames}</span>

          <wbr />

          <span>(Certified paper copy)</span>
        </span>
      ) : (
        <span css={LONG_TEXT_STYLE}>
          <span>
            {certificateProps.firstName} {certificateProps.lastName}
          </span>
          {certificateProps.type === 'birth' && (
            <>
              <wbr />

              <span>(Certified paper copy)</span>
            </>
          )}
        </span>
      )}

      {certificateProps.pending && (
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

    <div css={CERTIFICATE_SUBINFO_STYLE}>{certificateProps.subinfo}</div>
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

  return (
    <div
      className={`${thin ? 'p-v200' : 'p-v300'} br b--w ${borderClass}`}
      css={CERTIFICATE_ROW_STYLE}
    >
      {wrapperFunc
        ? wrapperFunc(renderCertificate(getCertificateProps(props), !!thin))
        : renderCertificate(getCertificateProps(props), !!thin)}
    </div>
  );
}

function getCertificateProps(certificateOrRequest) {
  if (certificateOrRequest.type === 'death') {
    return deathCertificateProps(certificateOrRequest.certificate);
  } else if (certificateOrRequest.type === 'birth') {
    return birthRequestProps(certificateOrRequest.certificate);
  } else {
    return marriageRequestProps(certificateOrRequest.certificate);
  }
}

function deathCertificateProps(certificate): CertificateProps {
  const {
    firstName,
    lastName,
    deathDate,
    deathYear,
    age,
    pending,
  } = certificate;

  return {
    firstName,
    lastName,
    subinfo: `Died: ${deathDate || deathYear} ${age && ` — Age: ${age}`}`,
    pending,
    type: 'death',
  };
}

function birthRequestProps(request): CertificateProps {
  const { firstName, lastName } = request.requestInformation;

  return {
    firstName,
    lastName,
    subinfo: `Born: ${request.dateString}`,
    pending: false,
    type: 'birth',
  };
}

function marriageRequestProps(request): CertificateProps {
  const {
    fullNames,
    // dateString
  } = request;

  // todo: temporary hack - 8/29 jm
  // return {
  //   fullNames,
  //   subinfo: `Married: ${dateString}`,
  //   pending: false,
  //   type: 'marriage',
  // };

  return {
    fullNames,
    subinfo: '',
    pending: false,
    type: 'marriage',
  };
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

const LONG_TEXT_STYLE = css({
  span: {
    whiteSpace: 'nowrap',

    '&:first-of-type': {
      marginRight: '0.4em',
    },
  },
});
