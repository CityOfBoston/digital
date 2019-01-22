import React from 'react';

import { css } from 'emotion';

import { CHARLES_BLUE, OPTIMISTIC_BLUE } from '@cityofboston/react-fleet';

import { STEPS } from './constants';

interface Props {
  currentStep: number;
  stepComplete?: boolean;
}

/**
 * Common header used for entire birth certificate request flow.
 */
export default function BirthCertificateRequestHeader(props: Props) {
  return (
    <>
      <h1 className="sh-title">Request a birth certificate</h1>

      <ProgressBar
        totalSteps={STEPS.length}
        currentStep={props.currentStep}
        currentStepCompleted={props.stepComplete}
      />
    </>
  );
}

interface ProgressBarProps {
  totalSteps: number;
  currentStep: number;
  currentStepCompleted?: boolean;
  showStepName?: string;
}

function ProgressBar(props: ProgressBarProps): JSX.Element {
  const { totalSteps, currentStep } = props;
  let progressText = `Step ${currentStep} of ${totalSteps}`;

  if (props.showStepName) {
    progressText = progressText + `: ${props.currentStep}`;
  }

  return (
    <div className={PROGRESS_BAR_STYLE}>
      <progress
        max={totalSteps}
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

      backgroundColor: OPTIMISTIC_BLUE,
    },

    '::-moz-progress-bar': {
      backgroundColor: OPTIMISTIC_BLUE,
    },

    '::-ms-fill': {
      backgroundColor: OPTIMISTIC_BLUE,
    },
  },

  span: {
    fontStyle: 'italic',
  },
});
