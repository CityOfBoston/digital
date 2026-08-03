/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { CHARLES_BLUE, SANS, SERIF } from '@cityofboston/react-fleet';

import { DeathCertificate } from '../../types';

interface Props {
  certificate: DeathCertificate;
}

/**
 * Custom details table for death STEP 2 (quantity) — matches Figma “Order
 * summary” block: gray panel, uppercase name header, label/value rows with
 * hairline dividers. Not the Fleet `.dl` definition list.
 */
export default function DeathCertificateDetailsTable({
  certificate,
}: Props): JSX.Element {
  const { firstName, lastName, birthDate, deathDate, deathYear, age } =
    certificate;

  const rows: Array<{ label: string; value: string }> = [
    { label: 'First name', value: firstName },
    { label: 'Last name', value: lastName },
  ];

  if (birthDate) {
    rows.push({ label: 'Date of birth', value: birthDate });
  }

  rows.push({ label: 'Date of death', value: deathDate || deathYear });

  if (age) {
    rows.push({ label: 'Age', value: age });
  }

  const fullName = `${firstName || ''} ${lastName || ''}`.trim();

  return (
    <div css={TABLE_STYLING}>
      <div css={HEADER_STYLING}>{fullName}</div>
      <dl css={ROWS_STYLING}>
        {rows.map((row, index) => (
          <div key={row.label} css={ROW_WRAP_STYLING}>
            {index > 0 && <div css={DIVIDER_STYLING} role="presentation" />}
            <div css={ROW_STYLING}>
              <dt css={LABEL_STYLING}>{row.label}</dt>
              <dd css={VALUE_STYLING}>{row.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

const TABLE_STYLING = css({
  boxSizing: 'border-box',
  width: '100%',
  padding: '10px',
  backgroundColor: '#f2f2f2',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

const HEADER_STYLING = css({
  margin: 0,
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1.125rem',
  lineHeight: 1.2,
  textTransform: 'uppercase',
  color: CHARLES_BLUE,
});

const ROWS_STYLING = css({
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
});

const ROW_WRAP_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
});

const DIVIDER_STYLING = css({
  height: 0,
  border: 'none',
  borderTop: '1px solid #d2d2d2',
  margin: 0,
});

const ROW_STYLING = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  margin: 0,
});

const LABEL_STYLING = css({
  margin: 0,
  fontFamily: SERIF,
  fontWeight: 700,
  fontSize: '1.125rem',
  lineHeight: 1.2,
  color: CHARLES_BLUE,
});

const VALUE_STYLING = css({
  margin: 0,
  fontFamily: SERIF,
  fontWeight: 400,
  fontSize: '1.125rem',
  lineHeight: 1.2,
  color: CHARLES_BLUE,
  textAlign: 'right',
});
