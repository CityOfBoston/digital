/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import {
  CHARLES_BLUE,
  OPTIMISTIC_BLUE_DARK,
  SANS,
  SERIF,
  WHITE,
} from '@cityofboston/react-fleet';

export type DuplicateIdentitySlot = 1 | 2;

interface Props {
  /** Which selection caused the duplicate and will be cleared on confirm. */
  slot: DuplicateIdentitySlot;
  onChooseAnother: () => void;
}

/**
 * Overlay shown when the same alternate identity document is selected for
 * both first and second proof of identity. Matches Figma “Overlay”
 * (node 3569:914).
 */
export default function DeathDuplicateIdentityOverlay(
  props: Props
): JSX.Element | null {
  const { slot, onChooseAnother } = props;
  const title =
    slot === 1
      ? 'Choose a different first document'
      : 'Choose a different second document';

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const confirmButton = document.getElementById(
      'death-duplicate-identity-confirm'
    );

    if (confirmButton) {
      confirmButton.focus();
    }

    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        onChooseAnother();
        return;
      }

      // Only one focusable control in this dialog — keep Tab inside it.
      if (ev.key === 'Tab') {
        ev.preventDefault();
        if (confirmButton) {
          confirmButton.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onChooseAnother]);

  const content = (
    <div
      css={BACKDROP_STYLING}
      role="dialog"
      aria-modal="true"
      aria-labelledby="death-duplicate-identity-title"
      aria-describedby="death-duplicate-identity-body"
    >
      <div css={PANEL_STYLING}>
        <h2 id="death-duplicate-identity-title" css={TITLE_STYLING}>
          {title}
        </h2>
        <p id="death-duplicate-identity-body" css={BODY_STYLING}>
          You selected the same document type twice. To verify your identity,
          choose two different documents.
        </p>
        <button
          type="button"
          id="death-duplicate-identity-confirm"
          css={BUTTON_STYLING}
          onClick={onChooseAnother}
        >
          Choose another document
        </button>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(content, document.body);
}

const BACKDROP_STYLING = css({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 10000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
  boxSizing: 'border-box',
  backgroundColor: 'rgba(9, 31, 47, 0.55)',
});

const PANEL_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  width: '100%',
  maxWidth: '28rem',
  padding: '40px',
  boxSizing: 'border-box',
  backgroundColor: WHITE,
  textAlign: 'center',
});

const TITLE_STYLING = css({
  margin: 0,
  width: '100%',
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '24px',
  lineHeight: 'normal',
  color: CHARLES_BLUE,
  wordBreak: 'break-word',
});

const BODY_STYLING = css({
  margin: 0,
  width: '100%',
  fontFamily: SERIF,
  fontWeight: 400,
  fontSize: '16px',
  lineHeight: 'normal',
  color: '#000',
  wordBreak: 'break-word',
});

const BUTTON_STYLING = css({
  appearance: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  height: '55px',
  padding: '10px',
  margin: 0,
  border: 'none',
  backgroundColor: OPTIMISTIC_BLUE_DARK,
  color: WHITE,
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '16px',
  lineHeight: 'normal',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  cursor: 'pointer',

  '&:hover, &:focus': {
    filter: 'brightness(0.95)',
  },

  '&:focus': {
    outline: `3px solid ${OPTIMISTIC_BLUE_DARK}`,
    outlineOffset: '2px',
  },
});
