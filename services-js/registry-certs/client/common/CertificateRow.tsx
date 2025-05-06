/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ReactChild } from 'react';

import { CHARLES_BLUE, GRAY_100, SERIF } from '@cityofboston/react-fleet';

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
  quantity?: number;
  showQuantity?: boolean;
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
      age: string;
    }
  | {
      type: 'birth';
      firstName: string;
      lastName: string;
      age: string;
    }
  | {
      type: 'marriage';
      fullNames: string;
      age: string;
    });

const renderCertificate = (
  certificateProps: CertificateProps,
  thin: boolean,
  quantity?: number,
  showQuantity?: boolean
) => {
  const qty = quantity ? quantity : 0;
  const show_quantity = showQuantity ? showQuantity : true;

  const capFirstLetterOfStr = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  let certTypeDateLabel = '';
  switch (certificateProps.type) {
    case 'death':
      certTypeDateLabel = 'Date of death:';
      break;
    case 'birth':
      certTypeDateLabel = 'Date of birth:';
      break;
    case 'marriage':
      certTypeDateLabel = 'Date of marriage:';
      break;
  }

  return (
    <div key="certificate" css={CERTIFICATE_INFO_BOX_STYLE}>
      <div
        className="t--sans m-v100"
        css={thin ? THIN_CERTIFICATE_NAME_STYLE : CERTIFICATE_NAME_STYLE}
      >
        {certificateProps.type === 'marriage' ? (
          <div css={LONG_TEXT_STYLE}>
            <span>
              {capFirstLetterOfStr(certificateProps.fullNames.toLowerCase())}
            </span>
          </div>
        ) : (
          <div css={LONG_TEXT_STYLE}>
            <span className={'label'}>Name:</span>
            <span className={'name'}>
              {capFirstLetterOfStr(certificateProps.firstName.toLowerCase())}{' '}
              {capFirstLetterOfStr(certificateProps.lastName.toLowerCase())}
            </span>

            {qty > 0 && show_quantity === true && (
              <>
                <span className="label"> x </span>
                <span className="name">{quantity}</span>
              </>
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
        )}
      </div>

      {certificateProps.subinfo.length > 0 && (
        <div css={LONG_TEXT_STYLE}>
          <div>
            <span className="label">{certTypeDateLabel}</span>
            <span className="name">{certificateProps.subinfo}</span>
          </div>
        </div>
      )}

      {certificateProps.age && (
        <div css={LONG_TEXT_STYLE}>
          <span className="label">Age:</span>
          <span className="name">{certificateProps.age}</span>
        </div>
      )}

      <div css={LONG_TEXT_STYLE}>
        {/* {certificateProps.type !== 'death' && (
          <>
            <wbr />

            <span>Certified Paper Copy (with raised seal)</span>
          </>
        )} */}

        <>
          <wbr />

          <span>Certified Paper Copy (with raised seal)</span>
        </>
      </div>
    </div>
  );
};

// This component takes an optional render prop as its child so that callers can
// construct their own rows. The function is given a <div> component for the
// certificate, and they can return it and other elements.

export default function CertificateRow(props: Props) {
  const {
    borderTop,
    borderBottom,
    children: wrapperFunc,
    thin,
    quantity,
    showQuantity = false,
  } = props;

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

  const qty: number = quantity && typeof quantity === 'number' ? quantity : 0;

  return (
    <>
      <div
        className={`${thin ? 'p-v200' : 'p-v300'} br ${borderClass}`}
        css={CERTIFICATE_ROW_STYLE}
      >
        {wrapperFunc
          ? wrapperFunc(
              renderCertificate(
                getCertificateProps(props),
                !!thin,
                qty,
                showQuantity
              )
            )
          : renderCertificate(
              getCertificateProps(props),
              !!thin,
              qty,
              showQuantity
            )}
      </div>
    </>
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
  const ageStr = age
    ? `${age}${!age.includes('days') && !age.includes('yr') ? 'yrs' : ''}`
    : '';

  return {
    firstName,
    lastName,
    subinfo: `${deathDate || deathYear}`,
    age: ageStr,
    pending,
    type: 'death',
  };
}

function birthRequestProps(request): CertificateProps {
  const { firstName, lastName } = request.requestInformation;

  const getAgeStr = dateString => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return {
    firstName,
    lastName,
    subinfo: `${request.dateString}`,
    pending: false,
    type: 'birth',
    age: `${getAgeStr(request.dateString)}`,
  };
}

function marriageRequestProps(request): CertificateProps {
  const { fullNames } = request;

  return {
    fullNames,
    subinfo: '',
    pending: false,
    type: 'marriage',
    age: '',
  };
}

const CERTIFICATE_INFO_BOX_STYLE = css({ flex: 1 });

const CERTIFICATE_NAME_STYLE = css({
  fontStyle: 'normal',
  fontWeight: 'bold',
  letterSpacing: '1.4px',
  lineHeight: '1.5em',
});

const THIN_CERTIFICATE_NAME_STYLE = css({
  fontStyle: 'normal',
  lineHeight: '1.5em',
});

const CERTIFICATE_ROW_STYLE = css({
  borderColor: GRAY_100,
  borderLeftWidth: 0,
  borderRightWidth: 0,

  display: 'flex',
  alignItems: 'center',
});

const LONG_TEXT_STYLE = css({
  fontFamily: SERIF,
  fontSize: '18px',
  marginBottom: '0.75rem',

  ['span.label']: {
    fontWeight: 700,
  },

  ['span.name']: {
    fontWeight: 'normal',
  },

  span: {
    whiteSpace: 'nowrap',

    '&:first-of-type': {
      marginRight: '0.4em',
    },
  },
});
