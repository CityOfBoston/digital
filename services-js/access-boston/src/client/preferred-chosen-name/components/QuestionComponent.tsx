/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { MouseEvent, ReactNode } from 'react';
import { MEDIA_SMALL /*, MEDIA_LARGE*/ } from '@cityofboston/react-fleet';

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
  } = props;

  return (
    <div css={CONTAINER_STYLING}>
      {children}

      <div className="g g--mr" css={BUTTON_CONTAINER_STYLING}>
        {handleStepBack && (
          <button
            type="button"
            className="btn btn--b-sm btn-alt"
            onClick={handleStepBack}
          >
            {prevBtnText || 'Go Back'}
          </button>
        )}

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
  },
});

const BUTTON_CONTAINER_STYLING = css({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px 8px',
  width: '100%',
  marginLeft: 'auto',
  marginRight: 'auto',
  padding: '0 60px 0',
  marginBottom: '4rem',
  position: 'relative',

  textAlign: 'center',

  [MEDIA_SMALL]: {
    textAlign: 'left',

    '> div': {
      display: 'flex',

      '&.ta-r > button': {
        marginLeft: 'auto',
      },
    },

    '.lnk': {
      paddingLeft: 0,
    },
  },

  '.btn': {
    fontSize: '16px',
    fontFamily: ' Montserrat',
  },

  '.btn-alt': {
    color: '#005EA2',
    background: 'white',
    borderRadius: '4px',
    border: '2px solid #005EA2',
  },

  '.successView__Btn-wrapper': {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',

    '.btn': {
      width: '181px',
      height: '44px',
      padding: '12px 20px',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
    },
  },
});
