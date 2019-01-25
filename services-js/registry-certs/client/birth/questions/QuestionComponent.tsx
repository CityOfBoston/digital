import React from 'react';

import {
  BUTTONS_CONTAINER_STYLING,
  NEXT_BUTTON_STYLE,
  QUESTION_CONTAINER_STYLING,
  SECONDARY_BUTTON_STYLE,
} from '../styling';

interface Props {
  handleProceed?: () => void;
  allowProceed?: boolean;
  handleStepBack?: () => void;
  handleReset?: () => void;
  startOver?: boolean;
  nextButtonText?: string;

  children: React.ReactNode;
}

/**
 * Container component to provide layout for a single question screen,
 * as well as “back”, “start over”, and “next question” buttons if their
 * related handlers are passed in as props to this component.
 */
export default function QuestionComponent(props: Props): JSX.Element {
  return (
    <>
      <div className={QUESTION_CONTAINER_STYLING}>{props.children}</div>

      <div className={BUTTONS_CONTAINER_STYLING}>
        {props.handleStepBack && (
          <button
            type="button"
            className={`btn ${SECONDARY_BUTTON_STYLE}`}
            onClick={props.handleStepBack}
          >
            Back
          </button>
        )}

        {/* Button only appears if handler was passed in AND props.startOver is true. */}
        {props.handleReset &&
          props.startOver && (
            <button
              type="button"
              className={`btn ${SECONDARY_BUTTON_STYLE}`}
              onClick={props.handleReset}
            >
              Back to start
            </button>
          )}

        {props.handleProceed &&
          !props.startOver && (
            <button
              type="button"
              className={`btn ${NEXT_BUTTON_STYLE}`}
              onClick={props.handleProceed}
              disabled={!props.allowProceed}
            >
              {props.nextButtonText || 'Next question'}
            </button>
          )}
      </div>
    </>
  );
}
