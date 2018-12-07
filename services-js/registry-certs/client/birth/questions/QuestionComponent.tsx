import React from 'react';
import { css } from 'emotion';

import {
  CHARLES_BLUE,
  MEDIA_SMALL,
  OPTIMISTIC_BLUE,
} from '@cityofboston/react-fleet';

interface Props {
  handleProceed?: () => void;
  allowProceed?: boolean;
  handleStepBack?: () => void;
  handleReset?: () => void;
  startOver?: boolean;

  children: React.ReactNode;
}

/**
 * Container component to provide layout for a single question screen,
 * as well as “back”, “start over”, and “next question” buttons if their
 * related handlers are passed in as props to this component.
 */
export default function QuestionComponent(props: Props): JSX.Element {
  return (
    <section>
      <div>{props.children}</div>

      <div className={BUTTONS_CONTAINER_STYLING}>
        {props.handleProceed &&
          !props.startOver && (
            <button
              type="button"
              className="btn"
              onClick={props.handleProceed}
              disabled={!props.allowProceed}
            >
              Next question
            </button>
          )}

        {/* Button only appears if handler was passed in AND props.startOver is true. */}
        {props.handleReset &&
          props.startOver && (
            <button
              type="button"
              className={`btn ${BACK_BUTTON_STYLING}`}
              onClick={props.handleReset}
            >
              Start over
            </button>
          )}

        {props.handleStepBack && (
          <button
            type="button"
            className={`btn ${BACK_BUTTON_STYLING}`}
            onClick={props.handleStepBack}
          >
            Back
          </button>
        )}
      </div>
    </section>
  );
}

const BUTTONS_CONTAINER_STYLING = css({
  marginTop: '3rem',
  [MEDIA_SMALL]: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    display: 'block',
    width: '100%',
    marginBottom: '2rem',
    [MEDIA_SMALL]: {
      width: 'auto',
      marginBottom: 0,
      '&:last-of-type': {
        order: -1,
        marginRight: '2rem',
      },
    },
  },
});

const BACK_BUTTON_STYLING = css({
  backgroundColor: '#fff',
  color: OPTIMISTIC_BLUE,
  border: '3px solid currentColor',
  '&:hover': {
    borderColor: CHARLES_BLUE,
  },
});
