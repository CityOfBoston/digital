/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import Link from 'next/link';

import {
  CHARLES_BLUE,
  OPTIMISTIC_BLUE_DARK,
  SANS,
  SERIF,
} from '@cityofboston/react-fleet';

import { CERTIFICATE_COST } from '../../../lib/costs';

export interface Props {
  type: 'death' | 'birth' | 'marriage';
  cert: any;
  quantity: number;
  /** Omitted on the read-only review/payment renderings. */
  handleRemove?: (() => void) & {};
  /** STEP 3 answers. Only shown for death, and only once SSN is answered. */
  relationshipLabel?: string | null;
  includeSsn?: boolean | null;
  supportingDocumentsUploaded?: boolean;
  /** Link back to STEP 3 for this line item. Omitted where editing is closed. */
  editHref?: string | null;
  unitCostCents?: number;
}

/**
 * Death cart line item — Figma STEP 4 “ORDER DETAILS” card. Also reused
 * read-only inside OrderDetails on the shipping / payment / review steps.
 * Name + unit price on top; detail rows stacked; Edit / Remove actions below.
 */
export const $CartItem = (props: Props) => {
  const {
    type: certificateTypeStr,
    quantity,
    handleRemove,
    relationshipLabel,
    includeSsn,
    supportingDocumentsUploaded,
    editHref,
  } = props;
  const { firstName, lastName, age, deathDate } = props.cert;

  const unitCostCents =
    props.unitCostCents != null
      ? props.unitCostCents
      : CERTIFICATE_COST.DEATH;
  const unitDollars = unitCostCents / 100;
  const priceLabel = Number.isInteger(unitDollars)
    ? `$${unitDollars}`
    : `$${unitDollars.toFixed(2)}`;

  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  const showSsn = typeof includeSsn === 'boolean';

  return (
    <div css={CART_ITEM_STYLING}>
      <div css={BODY_STYLING}>
        <div css={PRICE_STYLING}>{priceLabel}</div>

        <div css={DETAILS_STYLING}>
          <div css={NAME_STYLING}>{fullName}</div>

          {deathDate && (
            <p css={DETAIL_ROW_STYLING}>
              <span css={LABEL_STYLING}>Date of death:</span> {deathDate}
            </p>
          )}

          {age && certificateTypeStr === 'death' && (
            <p css={DETAIL_ROW_STYLING}>
              <span css={LABEL_STYLING}>Age:</span> {age}
            </p>
          )}

          <p css={DETAIL_ROW_STYLING}>
            <span css={LABEL_STYLING}>Quantity:</span> {quantity}
          </p>

          {certificateTypeStr === 'death' && showSsn && (
            <p css={DETAIL_ROW_STYLING}>
              <span css={LABEL_STYLING}>SSN included:</span>{' '}
              {includeSsn ? 'Yes' : 'No'}
            </p>
          )}

          {certificateTypeStr === 'death' &&
            includeSsn === true &&
            relationshipLabel && (
              <p css={DETAIL_ROW_STYLING}>
                <span css={LABEL_STYLING}>Relationship:</span>{' '}
                {relationshipLabel}
              </p>
            )}

          {certificateTypeStr === 'death' && supportingDocumentsUploaded && (
            <p css={DETAIL_ROW_STYLING}>
              <span css={LABEL_STYLING}>Supporting documents:</span>{' '}
              <span css={UPLOADED_STYLING}>
                Uploaded
                <img
                  src="/assets/images/death-check-circle.svg"
                  alt=""
                  width={24}
                  height={24}
                />
              </span>
            </p>
          )}
        </div>
      </div>

      {(editHref || handleRemove) && (
        <div css={ACTIONS_STYLING}>
          {editHref && (
            <Link href={editHref}>
              <a css={EDIT_LINK_STYLING}>Edit</a>
            </Link>
          )}
          {handleRemove && (
            <button
              type="button"
              css={REMOVE_BUTTON_STYLING}
              onClick={handleRemove}
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default $CartItem;

const CART_ITEM_STYLING = css({
  boxSizing: 'border-box',
  width: '100%',
  padding: '10px',
  border: '1px solid #d2d2d2',
  backgroundColor: 'transparent',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  color: CHARLES_BLUE,
});

const BODY_STYLING = css({
  position: 'relative',
  width: '100%',
  // Room for the absolutely positioned unit price on the right.
  paddingRight: '3.5rem',
});

const NAME_STYLING = css({
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1.125rem',
  lineHeight: 1.2,
  textTransform: 'uppercase',
  color: CHARLES_BLUE,
  minWidth: 0,
});

const PRICE_STYLING = css({
  position: 'absolute',
  top: 0,
  right: 0,
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1.125rem',
  lineHeight: 1.2,
  color: CHARLES_BLUE,
});

const DETAILS_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const DETAIL_ROW_STYLING = css({
  margin: 0,
  fontFamily: SERIF,
  fontWeight: 400,
  fontSize: '1.125rem',
  lineHeight: 1.3,
  color: CHARLES_BLUE,
});

const LABEL_STYLING = css({
  fontWeight: 600,
});

const UPLOADED_STYLING = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: 600,

  img: {
    display: 'block',
    width: 24,
    height: 24,
  },
});

const ACTIONS_STYLING = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  flexWrap: 'wrap',
});

const EDIT_LINK_STYLING = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '44px',
  padding: '10px',
  boxSizing: 'border-box',
  fontFamily: SERIF,
  fontWeight: 400,
  fontSize: '1.125rem',
  lineHeight: 1.2,
  color: OPTIMISTIC_BLUE_DARK,
  textDecoration: 'none',
  cursor: 'pointer',

  '&:hover, &:focus': {
    textDecoration: 'underline',
  },
});

const REMOVE_BUTTON_STYLING = css({
  appearance: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '44px',
  margin: 0,
  padding: '10px',
  boxSizing: 'border-box',
  border: 'none',
  background: 'transparent',
  fontFamily: SERIF,
  fontWeight: 400,
  fontSize: '1.125rem',
  lineHeight: 1.2,
  color: '#cb1e00',
  cursor: 'pointer',

  '&:hover, &:focus': {
    textDecoration: 'underline',
  },
});
