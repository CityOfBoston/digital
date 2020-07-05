/** @jsx jsx */
import { css, jsx } from '@emotion/core';

import { CHARLES_BLUE, OPTIMISTIC_BLUE_LIGHT } from '../utilities/constants';

interface Props {
  totalSteps: number;
  currentStep: number;
  currentStepCompleted?: boolean;
  showStepName?: string;
  offset?: number | undefined;
}

/**
 * Component to indicate a user’s progress through a number of tasks.
 *
 * Displays current step number in relation to total number of steps below
 * the visual progress indicator.
 *
 * When the current step is completed, the progress bar will grow i.e:
 * when the user begins, the visual progress bar shows no progress. Once the
 * user performs the task, the visual progress bar will grow; see the
 * react-fleet Storybook for an interactive demonstration of this behavior.
 *
 * “showStepName” property may be used to additionally display the name of
 * the current task.
 */
export default function ProgressBar(props: Props): JSX.Element {
  const { totalSteps, currentStep, offset } = props;
  let progressText = `Step ${currentStep} of ${totalSteps}`;

  if (props.showStepName) {
    progressText = progressText + `: ${props.showStepName}`;
  }

  const total =
    offset && typeof offset === 'number' ? totalSteps + offset : totalSteps;

  return (
    <div css={PROGRESS_BAR_STYLE}>
      <progress
        max={total}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={currentStep}
        aria-valuetext={progressText}
        value={props.currentStepCompleted ? currentStep : currentStep - 1}
      >
        {progressText}
      </progress>

      {/* hidden from screenreaders to avoid repetition */}
      <span aria-hidden="true">{progressText}</span>
    </div>
  );
}

const PROGRESS_BAR_STYLE = css({
  progress: {
    margin: '1rem 0 0.25rem',
    width: '100%',
    height: '1rem',
    border: `2px solid ${CHARLES_BLUE}`,
    backgroundColor: '#fff',

    '::-webkit-progress-bar': {
      backgroundColor: '#fff',
    },

    '::-webkit-progress-value': {
      transition: 'width 0.5s',

      backgroundColor: OPTIMISTIC_BLUE_LIGHT,
    },

    '::-moz-progress-bar': {
      backgroundColor: OPTIMISTIC_BLUE_LIGHT,
    },

    '::-ms-fill': {
      backgroundColor: OPTIMISTIC_BLUE_LIGHT,
    },
  },

  span: {
    fontStyle: 'italic',
  },
});
