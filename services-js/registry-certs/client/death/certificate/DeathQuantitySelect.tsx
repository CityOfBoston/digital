/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent, useEffect, useRef, useState } from 'react';

import {
  CHARLES_BLUE,
  OPTIMISTIC_BLUE_DARK,
  SERIF,
  WHITE,
} from '@cityofboston/react-fleet';

interface Props {
  quantity: number | null;
  onChange: (value: number | null) => void;
}

/**
 * Quantity control for death STEP 2 — Figma “Quantity: N” dropdown (not Fleet
 * `.sel-f` / shared QuantityDropdown). Supports 1–10 plus Other… for free entry.
 */
export default function DeathQuantitySelect(props: Props): JSX.Element {
  const [selectValue, setSelectValue] = useState<string>('1');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const inputField = useRef<HTMLInputElement>(null);

  const commitQuantity = (value: number | null) => {
    props.onChange(value);
  };

  const handleSelectChange = (ev: ChangeEvent<HTMLSelectElement>) => {
    const value = ev.target.value;
    setSelectValue(value);

    if (value === 'other') {
      setQuantity('');
      commitQuantity(null);
      window.setTimeout(() => {
        if (inputField.current) {
          inputField.current.focus();
        }
      }, 0);
      return;
    }

    const next = parseInt(value, 10);
    setQuantity(next);
    commitQuantity(next);
  };

  const handleInputChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const raw = ev.target.value;

    if (!raw) {
      setQuantity('');
      commitQuantity(null);
      return;
    }

    const next = parseInt(raw, 10);
    if (!Number.isFinite(next) || next > 99) {
      return;
    }

    setQuantity(next);
    // Stay on "other" while typing. Syncing the select to 1–10 would unmount
    // this input as soon as the first digit is entered (e.g. "1" of "12").
    commitQuantity(next);
  };

  const handleInputBlur = () => {
    if (quantity === '' || quantity < 1) {
      setQuantity(1);
      setSelectValue('1');
      commitQuantity(1);
      return;
    }

    // Collapse back to the dropdown when the value is in the 1–10 range.
    if (quantity <= 10) {
      setSelectValue(String(quantity));
    }
  };

  useEffect(() => {
    if (props.quantity && props.quantity > 0) {
      setQuantity(props.quantity);
      setSelectValue(props.quantity > 10 ? 'other' : String(props.quantity));
    }
    // Seed from initial cart / URL quantity only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showOtherInput = selectValue === 'other';
  const displayValue = showOtherInput ? 'Other…' : selectValue;

  return (
    <div css={WRAP_STYLING}>
      <div css={SELECT_WRAP_STYLING}>
        {/*
          Invisible sizer drives the control width from the full label + value
          so “Other…” isn’t clipped to “O” in a fixed-width field.
        */}
        <span css={SIZER_STYLING} aria-hidden="true">
          Quantity:&nbsp;{displayValue}
        </span>
        <span css={PREFIX_STYLING} aria-hidden="true">
          Quantity:
        </span>
        <select
          name="quantity"
          aria-label="Quantity"
          value={selectValue}
          onChange={handleSelectChange}
          css={SELECT_STYLING}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <option key={n} value={String(n)}>
              {n}
            </option>
          ))}
          <option disabled>---------------</option>
          <option value="other">Other…</option>
        </select>
        <span css={CARET_STYLING} aria-hidden="true">
          <svg width="17" height="9" viewBox="0 0 17 9" fill="none">
            <path
              d="M1 1L8.5 8L16 1"
              stroke={CHARLES_BLUE}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {showOtherInput && (
        <input
          ref={inputField}
          type="number"
          min={1}
          max={99}
          name="quantityOther"
          aria-label="Enter quantity"
          css={OTHER_INPUT_STYLING}
          value={quantity}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
        />
      )}
    </div>
  );
}

const WRAP_STYLING = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  flexShrink: 0,
});

const SELECT_WRAP_STYLING = css({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  minWidth: '136px',
  height: '44px',
  flexShrink: 0,
  boxSizing: 'border-box',
  backgroundColor: WHITE,
  border: `1px solid ${CHARLES_BLUE}`,
});

const SIZER_STYLING = css({
  visibility: 'hidden',
  whiteSpace: 'nowrap',
  fontFamily: SERIF,
  fontSize: '18px',
  lineHeight: '23px',
  fontWeight: 400,
  // Match select horizontal padding so caret + label clearance size the box.
  padding: '10px 34px 10px 8px',
  boxSizing: 'border-box',
  height: '44px',
  pointerEvents: 'none',
});

const PREFIX_STYLING = css({
  position: 'absolute',
  left: '8px',
  top: '50%',
  transform: 'translateY(-50%)',
  fontFamily: SERIF,
  fontSize: '18px',
  lineHeight: '23px',
  fontWeight: 400,
  color: CHARLES_BLUE,
  pointerEvents: 'none',
  zIndex: 1,
});

const SELECT_STYLING = css({
  position: 'absolute',
  left: 0,
  top: 0,
  display: 'block',
  width: '100%',
  height: '100%',
  margin: 0,
  // Left pad clears the static “Quantity:” label; right pad clears the caret.
  padding: '10px 28px 10px 92px',
  boxSizing: 'border-box',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: 0,
  fontFamily: SERIF,
  fontSize: '18px',
  lineHeight: '23px',
  fontWeight: 400,
  color: CHARLES_BLUE,
  cursor: 'pointer',

  '&:focus': {
    outline: `2px solid ${OPTIMISTIC_BLUE_DARK}`,
    outlineOffset: '1px',
  },

  '&::-ms-expand': {
    display: 'none',
  },
});

const CARET_STYLING = css({
  position: 'absolute',
  right: '6px',
  top: '50%',
  // Nudge down slightly so the chevron optically lines up with the text.
  transform: 'translateY(calc(-50% + 1px))',
  paddingTop: '2px',
  boxSizing: 'border-box',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
});

const OTHER_INPUT_STYLING = css({
  width: '4.5rem',
  height: '44px',
  margin: 0,
  padding: '10px 8px',
  boxSizing: 'border-box',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  backgroundColor: WHITE,
  border: `1px solid ${CHARLES_BLUE}`,
  borderRadius: 0,
  fontFamily: SERIF,
  fontSize: '18px',
  lineHeight: '23px',
  color: CHARLES_BLUE,
  textAlign: 'right',

  '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },

  '&:focus': {
    outline: `2px solid ${OPTIMISTIC_BLUE_DARK}`,
    outlineOffset: '1px',
  },
});
