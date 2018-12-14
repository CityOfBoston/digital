import React from 'react';

import { BUTTONS_CONTAINER_STYLING, SECONDARY_BUTTON_STYLE } from './styling';

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
        {/* Button only appears if handler was passed in AND props.startOver is true. */}
        {props.handleReset &&
          props.startOver && (
            <button
              type="button"
              className={`btn ${SECONDARY_BUTTON_STYLE}`}
              onClick={props.handleReset}
            >
              Start over
            </button>
          )}

        {props.handleStepBack &&
          !props.startOver && (
            <button
              type="button"
              className={`btn ${SECONDARY_BUTTON_STYLE}`}
              onClick={props.handleStepBack}
            >
              Back
            </button>
          )}

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
      </div>
    </section>
  );
}
