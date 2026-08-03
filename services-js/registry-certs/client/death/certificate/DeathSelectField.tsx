/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent } from 'react';

import {
  CHARLES_BLUE,
  OPTIMISTIC_BLUE_DARK,
  SANS,
  SERIF,
  WHITE,
} from '@cityofboston/react-fleet';

interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  name: string;
  value: string;
  options: Option[];
  required?: boolean;
  hideBlankOption?: boolean;
  blankLabel?: string;
  onChange: (ev: ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Custom dropdown for death STEP 3 — matches Figma Dropdown (not CoB .sel-f).
 * White field, #d2d2d2 border, Lora 18px text, blue caret.
 */
export default function DeathSelectField(props: Props): JSX.Element {
  const {
    label,
    name,
    value,
    options,
    required,
    hideBlankOption,
    blankLabel = 'Select one',
    onChange,
  } = props;

  return (
    <div css={FIELD_STYLING}>
      <label htmlFor={name} css={LABEL_STYLING}>
        {label} {required && <span className="t--req">Required</span>}
      </label>
      <div css={SELECT_WRAP_STYLING}>
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          aria-required={required}
          css={SELECT_STYLING}
        >
          {!hideBlankOption && <option value="">{blankLabel}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span css={CARET_STYLING} aria-hidden="true">
          <svg width="17" height="9" viewBox="0 0 17 9" fill="none">
            <path
              d="M1 1L8.5 8L16 1"
              stroke={OPTIMISTIC_BLUE_DARK}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}

const FIELD_STYLING = css({
  display: 'block',
  width: '100%',
});

const LABEL_STYLING = css({
  display: 'block',
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1rem',
  color: CHARLES_BLUE,
  marginBottom: '0.5rem',
});

const SELECT_WRAP_STYLING = css({
  position: 'relative',
  width: '100%',
});

const SELECT_STYLING = css({
  display: 'block',
  width: '100%',
  height: '44px',
  margin: 0,
  padding: '10px 40px 10px 8px',
  boxSizing: 'border-box',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  backgroundColor: WHITE,
  border: '1px solid #d2d2d2',
  borderRadius: 0,
  fontFamily: SERIF,
  fontSize: '18px',
  lineHeight: '23px',
  color: CHARLES_BLUE,
  cursor: 'pointer',

  '&:focus': {
    outline: `2px solid ${OPTIMISTIC_BLUE_DARK}`,
    outlineOffset: '1px',
  },

  // Hide IE/old edge native arrow
  '&::-ms-expand': {
    display: 'none',
  },
});

const CARET_STYLING = css({
  position: 'absolute',
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
});
