/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { MouseEvent, ReactNode } from 'react';
import { MEDIA_SMALL } from '@cityofboston/react-fleet';

interface Props {
  children: ReactNode;
  allowProceed?: boolean;
  quitBtn?: boolean;
  handleProceed?: (ev: MouseEvent) => void;
  handleStepBack?: (ev: MouseEvent) => void;
  handleReset?: (ev: MouseEvent) => void;
  handleQuit?: (ev: MouseEvent) => void;
  nextButtonText?: string;
  prevBtnText?: string;
  quitBtnText?: string;
  extraButtons?: ReactNode;
}

/**
 * Container component to provide layout for a single question screen,
 * as well as “back”, “start over”, and “next question” buttons if their
 * related handlers are passed in as props to this component.
 */
export default function QuestionComponent(props: Props): JSX.Element {
  const {
    children,
    nextButtonText,
    prevBtnText,
    allowProceed,
    handleProceed,
    handleStepBack,
    handleQuit,
    quitBtn,
    quitBtnText,
    extraButtons
  } = props;

  return (
    <div css={CONTAINER_STYLING}>
      {children}

      <div css={BUTTON_CONTAINER_STYLING}>
        {handleStepBack && (
          <button
            type="button"
            className="btn btn--b-sm btn-alt"
            onClick={handleStepBack}
          >
            {prevBtnText || 'Go Back'}
          </button>
        )}

        {extraButtons} {/* Renders Clear button next to Continue */}

        {handleProceed && (
          <button
            type="button"
            className="btn btn--b-sm"
            onClick={handleProceed}
            disabled={!allowProceed}
          >
            {nextButtonText || 'Continue'}
          </button>
        )}

        {quitBtn && handleQuit && (
          <div className="successView__Btn-wrapper">
            <button
              type="button"
              className="btn btn--b-sm"
              onClick={handleQuit}
            >
              {quitBtnText || 'Quit'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const CONTAINER_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  lineHeight: '1.5rem',
  margin: 'auto',
  width: '100%',

  p: {
    lineHeight: '2rem',
  }
});

const BUTTON_CONTAINER_STYLING = css({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '0 60px',
  boxSizing: 'border-box',
  marginBottom: '2rem',
  overflow: 'hidden',

  '.btn': {
    fontSize: '22px',
    fontFamily: 'Montserrat',
    height: '60px',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },

  '.btn-alt': {
    color: '#005EA2',
    background: 'white',
    borderRadius: '4px',
    border: '2px solid #005EA2',
  },

  '.successView__Btn-wrapper': {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',

    '.btn': {
      width: '240px',
    },
  },

  // Mobile adjustments
  '@media (max-width: 600px)': {
    padding: '0 10px',
    gap: '4px',

    // Adjusts buttons to share space equally on mobile and appear smaller
    '& > .btn, & > .btn-alt': {
      flex: 1,
      width: '100%',
      maxWidth: '100%',
      height: '45px',
      fontSize: '18px',
      margin: '0 2px',
      padding: '8px 16px',
      boxSizing: 'border-box',
    },
  },
});