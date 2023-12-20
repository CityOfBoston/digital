/** @jsx jsx */
import { css, jsx } from '@emotion/core';

import {
  // CHARLES_BLUE,
  BLACK,
  WHITE,
  OPTIMISTIC_BLUE_DARK,
} from '../utilities/constants';

import { stepObj } from '../utilities/interfaces';

interface Props {
  steps: Array<stepObj>;
  totalSteps?: number;
  currentStep?: number;
  currentStepCompleted?: boolean;
  stepName?: string;
  offset?: number | undefined;
}

export default function ProgressBarUI(props: Props): JSX.Element {
  const {
    steps,
    // totalSteps,
    // currentStep,
    // offset
  } = props;
  console.log('ProgressBarUI > props: ', props);

  const stepClick = (): void => {
    console.log(`Step Click: #`);
  };

  const stepElem = (step: stepObj, key) => {
    const completed = step.completed ? `completed` : ``;
    const elem = (
      <a onClick={stepClick} key={key} className={`${completed}`}>
        {step.label}
        {/* <span class="arrow" /> */}
      </a>
    );
    return elem;
  };

  return (
    <div css={PROGRESSBAR_STYLE}>
      {steps && steps.map((step, index) => stepElem(step, index))}
    </div>
  );
}

const BORDER_WIDTH = '1px';
const PROGRESSBAR_STYLE = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  lineHeight: 'normal',
  fontStyle: 'normal',
  fontFamily: 'Lora',
  fontSize: '0.5em',
  color: BLACK,

  a: {
    borderWidth: BORDER_WIDTH,
    borderColor: BLACK,
    borderStyle: 'solid',
    borderLeftWidth: '0',
    padding: '0.85em 1.5em',
    minWidth: '100px',
    color: BLACK,
    cursor: 'pointer',

    '&:first-child': {
      color: 'green',
      borderLeftWidth: BORDER_WIDTH,
    },

    '&:hover': {
      color: WHITE,
      background: OPTIMISTIC_BLUE_DARK,
    },

    '&.completed': {
      color: WHITE,
      background: OPTIMISTIC_BLUE_DARK,
    },
  },
});
