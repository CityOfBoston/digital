/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { MouseEvent, ReactNode } from 'react';

import RedirectForm from '../../RedirectForm';
import { Spinner } from '../../common/Spinner';

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
  useRedirectForm?: boolean;
  useLoadingSpinner?: boolean;
  loading?: boolean;
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
    extraButtons,
    useRedirectForm,
  } = props;

  const proceedBtnStr = (): JSX.Element => {
    if (
      props.useLoadingSpinner &&
      props.useLoadingSpinner === true &&
      props.loading &&
      props.loading === true
    ) {
      return (
        <>
          <Spinner size="1.2em" />
        </>
      );
    }

    return <>{nextButtonText || 'Continue'}</>;
  };

  return (
    <div css={CONTAINER_STYLING}>
      {children}

      <div css={BUTTON_CONTAINER_STYLING}>
        {handleStepBack && (
          <button
            type="button"
            className="btn btn--b-sm btn-alt btn--w"
            onClick={handleStepBack}
            tabIndex={0}
            title={prevBtnText || 'Back'}
          >
            {prevBtnText || 'Back'}
          </button>
        )}
        {extraButtons} {/* Renders Clear button next to Continue */}
        {handleProceed && (
          <button
            type="button"
            className="btn btn--b-sm"
            onClick={handleProceed}
            disabled={
              !allowProceed ||
              (props.useLoadingSpinner &&
                props.useLoadingSpinner === true &&
                props.loading &&
                props.loading === true)
            }
            tabIndex={0}
            title={nextButtonText || 'Continue'}
          >
            {proceedBtnStr()}
          </button>
        )}
        {quitBtn && handleQuit && !useRedirectForm && (
          <div className="successView__Btn-wrapper">
            <button
              type="button"
              className="btn btn--b-sm"
              onClick={handleQuit}
              tabIndex={0}
              title={quitBtnText || 'Quit'}
            >
              {quitBtnText || 'Quit'}
            </button>
          </div>
        )}
        {quitBtn && handleQuit && useRedirectForm && (
          <div className="successView__Btn-wrapper">
            <RedirectForm path="/logout">
              <button
                type="submit"
                className="btn btn--sm btn--100"
                tabIndex={0}
                title={quitBtnText || 'Quit'}
              >
                {quitBtnText || 'Quit'}
              </button>
            </RedirectForm>
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
    lineHeight: '1.5em',
  },
});

const BUTTON_CONTAINER_STYLING = css({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '0 40px',
  boxSizing: 'border-box',
  marginBottom: '2rem',
  overflow: 'hidden',

  '.btn': {
    fontSize: '16px',
    fontFamily: 'Montserrat',
    height: '48px',
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

    '@media (max-width: 600px)': {
      '.btn': {
        fontSize: '14px',
        height: '40px',
        width: '100%',
      },
      height: '50px',
    },
  },

  // Mobile adjustments
  '@media (max-width: 600px)': {
    padding: '0 10px',
    gap: '4px',
    marginBottom: '10px',

    // Adjusts buttons to share space equally on mobile and appear smaller
    '& > .btn, & > .btn-alt': {
      flex: 1,
      width: '100%',
      maxWidth: '100%',
      height: '48px',
      fontSize: '14px',
      margin: '10px 0px',
      boxSizing: 'border-box',
    },
  },
});
