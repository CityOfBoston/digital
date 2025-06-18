/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import Link from 'next/link';

import { DeathCertificate } from '../../types';

import {
  CHARLES_BLUE,
  GRAY_000,
  OPTIMISTIC_BLUE_DARK,
  SANS,
  SERIF,
} from '@cityofboston/react-fleet';

export interface Props {
  certificate: DeathCertificate;
  backUrl: string;
}

export default function SearchResult({ backUrl, certificate }: Props) {
  const {
    id,
    firstName,
    lastName,
    deathDate,
    deathYear,
    age,
    pending,
  } = certificate;

  const ageStr = age
    ? `${age}${
        !age.includes('days') && !age.includes('yr') && !age.includes('yrs')
          ? ''
          : ''
      }`
    : '';
  // ? `${age}${!age.includes('days') && !age.includes('yr') ? ' yrs' : ''}`
  // const ageStr = age;

  return (
    <div css={LINK_CSS}>
      <Link
        href={`/death/certificate?id=${id}&backUrl=${encodeURIComponent(
          backUrl
        )}`}
        prefetch={process.env.NODE_ENV !== 'test'}
        as={`/death/certificate/${id}`}
      >
        <a>
          {`${firstName.toUpperCase()} ${lastName.toUpperCase()}`}
          {pending && (
            <span style={{ color: CHARLES_BLUE, fontFamily: SERIF }}>
              {' - '}
              <span
                className="t--sans tt-u"
                style={{ fontStyle: 'normal', fontWeight: 'bold' }}
              >
                pending
              </span>
            </span>
          )}
        </a>
      </Link>

      {deathDate && deathDate.length > 0 && deathYear && deathYear.length > 0 && (
        <p>
          <span className="label">Date of death:</span> {deathDate || deathYear}
        </p>
      )}

      {ageStr.length > 0 && (
        <p>
          <span className="label">Age:</span> {ageStr}
        </p>
      )}
    </div>
  );
}

const LINK_CSS = css`
  font-weight: normal;
  font-size: 1em;
  font-family: ${SERIF};
  padding: 1.5rem 0 0.25rem;
  border-bottom: 1px solid ${GRAY_000};
  
  a {
    font-weight: 700;
    color: ${OPTIMISTIC_BLUE_DARK}
    font-size: 1.125em;
    font-family: ${SANS};
    cursor: pointer;
  }

  span.label {
    font-weight: 700;
  }
`;
