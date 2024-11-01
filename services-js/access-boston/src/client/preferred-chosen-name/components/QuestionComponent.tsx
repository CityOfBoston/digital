/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { MouseEvent, ReactNode } from 'react';
import { MEDIA_SMALL /*, MEDIA_LARGE*/ } from '@cityofboston/react-fleet';

import BackButton from '../../common/BackButton';

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
    nextButtonText,
    allowProceed,
    handleProceed,
    handleStepBack,
    // startOver,
    // handleReset,
    // quitBtn,
    // squareStyleBackBtn,
    // handleQuit,
  } = props;

  return (
    <div css={CONTAINER_STYLING}>
      {children}

      <div className="g g--mr" css={BUTTON_CONTAINER_STYLING}>
        {handleStepBack && <BackButton handleClick={handleStepBack} />}
        {handleProceed && (
          <button
            type="button"
            className="btn btn--b-sm"
            onClick={handleProceed}
            disabled={!allowProceed}
          >
            {nextButtonText || 'Continue'} 1
          </button>
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
});
