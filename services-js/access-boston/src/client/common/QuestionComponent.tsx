/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { MouseEvent, ReactNode } from 'react';

import { MEDIA_SMALL /*, MEDIA_LARGE*/ } from '@cityofboston/react-fleet';

import BackButton from './BackButton';

interface Props {
  handleProceed?: (ev: MouseEvent) => void;
  allowProceed?: boolean;
  handleStepBack?: (ev: MouseEvent) => void;
  handleReset?: (ev: MouseEvent) => void;
  handleQuit?: (ev: MouseEvent) => void;
  startOver?: boolean;
  nextButtonText?: string;
  children: ReactNode;
  quitBtn?: boolean;
  squareStyleBackBtn?: boolean;
}

/**
 * Container component to provide layout for a single question screen,
 * as well as “back”, “start over”, and “next question” buttons if their
 * related handlers are passed in as props to this component.
 */
export default function QuestionComponent(props: Props): JSX.Element {
  const {
    children,
    handleReset,
    handleProceed,
    handleStepBack,
    nextButtonText,
    allowProceed,
    startOver,
    quitBtn,
    squareStyleBackBtn,
    handleQuit,
  } = props;

  const useG8Css = squareStyleBackBtn && quitBtn ? `8` : `6`;
  const proceedBtnCss = `g--${useG8Css} ta-r m-b500`;

  return (
    <div css={CONTAINER_STYLING}>
      <div css={HEADER_STYLING}>{children}</div>

      <div className="g g--mr" css={BUTTON_CONTAINER_STYLING}>
        {!quitBtn && !squareStyleBackBtn && (
          <div className="t--info g--6 m-b500">
            {handleStepBack && <BackButton handleClick={handleStepBack} />}
          </div>
        )}

        {quitBtn && handleQuit && (
          <div className="g--1 ta-r m-b500">
            <button
              type="button"
              className="btn btn--b-sm"
              onClick={handleQuit}
            >
              {'Quit'}
            </button>
          </div>
        )}

        {squareStyleBackBtn && (
          <div className="g--3 ta-r m-b500">
            <button
              type="button"
              className="btn btn--b-sm"
              onClick={handleStepBack}
            >
              {'Go Back'}
            </button>
          </div>
        )}

        <div className={proceedBtnCss}>
          {handleProceed && !startOver && (
            <button
              type="button"
              className="btn btn--b-sm"
              onClick={handleProceed}
              disabled={!allowProceed}
            >
              {nextButtonText || 'Next question'}
            </button>
          )}

          {/* Button only appears if handler was passed in AND startOver is true. */}
          {handleReset && startOver && (
            <button
              type="button"
              className="btn btn--b-sm"
              onClick={handleReset}
            >
              Start over
            </button>
          )}
        </div>
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
});

const HEADER_STYLING = css({
  'fieldset + fieldset': {
    marginTop: '2rem',

    [MEDIA_SMALL]: {
      marginTop: '4rem',

      '.lnk': {
        paddingLeft: 0,
      },
    },
  },
});

const BUTTON_CONTAINER_STYLING = css({
  width: '100%',
  marginLeft: 'auto',
  marginRight: 'auto',
  position: 'relative',

  textAlign: 'center',

  [MEDIA_SMALL]: {
    marginTop: '2.5rem',
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
});
