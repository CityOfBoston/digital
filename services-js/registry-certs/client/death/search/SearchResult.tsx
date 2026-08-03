/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import Link from 'next/link';

import { DeathCertificate } from '../../types';

import {
  CHARLES_BLUE,
  OPTIMISTIC_BLUE_DARK,
  SANS,
  SERIF,
} from '@cityofboston/react-fleet';

export interface Props {
  certificate: DeathCertificate;
  backUrl: string;
}

/**
 * Search result card for death STEP 1 — Figma “Person” card style (not the
 * old bottom-border list row). Entire card is the hit target.
 */
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

  const href = `/death/certificate?id=${id}&backUrl=${encodeURIComponent(
    backUrl
  )}`;
  const as = `/death/certificate/${id}`;
  const deathDateDisplay = deathDate || deathYear;

  return (
    <Link href={href} prefetch={process.env.NODE_ENV !== 'test'} as={as}>
      <a css={CARD_STYLING}>
        <div css={CONTENT_STYLING}>
          <div className="search-result-name" css={NAME_STYLING}>
            {`${firstName.toUpperCase()} ${lastName.toUpperCase()}`}
            {pending && (
              <span className="search-result-pending" css={PENDING_STYLING}>
                {' — '}
                <span className="t--sans tt-u">pending</span>
              </span>
            )}
          </div>

          {deathDateDisplay && (
            <p className="search-result-detail" css={DETAIL_STYLING}>
              <span css={LABEL_STYLING}>Date of death:</span> {deathDateDisplay}
            </p>
          )}

          {age && (
            <p className="search-result-detail" css={DETAIL_STYLING}>
              <span css={LABEL_STYLING}>Age:</span> {age}
            </p>
          )}
        </div>
      </a>
    </Link>
  );
}

const CARD_STYLING = css({
  display: 'block',
  boxSizing: 'border-box',
  width: '100%',
  padding: '8px',
  border: '1px solid #d2d2d2',
  backgroundColor: '#fff',
  textDecoration: 'none',
  cursor: 'pointer',
  color: 'inherit',

  '&:hover, &:focus': {
    backgroundColor: '#1871bd',
    borderColor: '#1871bd',

    '.search-result-name, .search-result-pending, .search-result-detail, .search-result-detail *': {
      color: '#fff',
    },
  },
});

const CONTENT_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  minWidth: 0,
});

const NAME_STYLING = css({
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1.125rem',
  lineHeight: 1.2,
  color: OPTIMISTIC_BLUE_DARK,
});

const PENDING_STYLING = css({
  color: CHARLES_BLUE,
  fontFamily: SERIF,
  fontWeight: 400,
  fontSize: '1rem',

  '.tt-u': {
    fontStyle: 'normal',
    fontWeight: 700,
    fontFamily: SANS,
  },
});

const DETAIL_STYLING = css({
  margin: 0,
  fontFamily: SERIF,
  fontWeight: 400,
  fontSize: '1rem',
  lineHeight: 1.2,
  color: CHARLES_BLUE,
});

const LABEL_STYLING = css({
  fontWeight: 600,
});
