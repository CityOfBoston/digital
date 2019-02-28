import React, { MouseEvent } from 'react';

import BackButton from '../components/BackButton';

import {
  QUESTION_BUTTON_CONTAINER_STYLING,
  QUESTION_CONTAINER_STYLING,
} from '../styling';

interface Props {
  handleProceed?: (ev: MouseEvent) => void;
  allowProceed?: boolean;
  handleStepBack?: (ev: MouseEvent) => void;
  handleReset?: (ev: MouseEvent) => void;
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

      <div className={`g g--mr ${QUESTION_BUTTON_CONTAINER_STYLING}`}>
        <div className="t--info g--6 m-b500">
          {props.handleStepBack && (
            <BackButton handleClick={props.handleStepBack} />
          )}
        </div>

        <div className="g--6 ta-r m-b500">
          {props.handleProceed &&
            !props.startOver && (
              <button
                type="button"
                className="btn btn--b-sm"
                onClick={props.handleProceed}
                disabled={!props.allowProceed}
              >
                {props.nextButtonText || 'Next question'}
              </button>
            )}

          {/* Button only appears if handler was passed in AND props.startOver is true. */}
          {props.handleReset &&
            props.startOver && (
              <button
                type="button"
                className="btn btn--b-sm"
                onClick={props.handleReset}
              >
                Start over
              </button>
            )}
        </div>
      </div>
    </>
  );
}
