/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useState } from 'react';

import {
  // CHARLES_BLUE,
  BLACK,
  WHITE,
  OPTIMISTIC_BLUE_DARK,
  // MEDIA_SMALL_MAX,
} from '../utilities/constants';

import { stepObj } from '../utilities/interfaces';

interface Props {
  steps: Array<stepObj>;
  totalSteps?: number;
  currentStep: number;
  currentStepCompleted?: boolean;
  showStepName?: boolean;
  offset?: number;
}

export default function ProgressBarUI(props: Props): JSX.Element {
  const { steps, currentStep, showStepName, offset } = props;
  const [focused, setFocus] = useState<number>(currentStep);
  const stepClick = (): void => {
    console.log(`Step Click: #`);
  };

  const stepElem = (step: stepObj, key: number) => {
    const completed = step.completed ? `completed` : ``;
    const currentCss = currentStep === key ? `current` : ``;
    const elem = (
      <a
        onClick={stepClick}
        key={key}
        className={`${completed} ${currentCss}`}
        title={`${step.label}`}
        aria-label={`${step.label}`}
        onTouchMove={() => setFocus(key)}
        onMouseEnter={() => setFocus(key)}
      >
        {step.label}
        <span className="arrow" />
      </a>
    );
    return elem;
  };

  const currStepCount =
    offset && typeof offset === 'number' ? currentStep + offset : currentStep;
  const progressText = () => {
    return <span>{`Step ${currStepCount} of ${steps.length}`}</span>;
  };

  const mobileText = () => {
    return (
      <span className="mobile">
        {`: `}
        {steps[focused].label}
      </span>
    );
  };

  return (
    <div css={PROGRESSBAR_STYLE}>
      <div className="progressbar">
        <div className="nav">
          {steps && steps.map((step, index) => stepElem(step, index))}
        </div>
        <div className="progress-text">
          {progressText()}
          {showStepName && mobileText()}
        </div>
      </div>
    </div>
  );
}

const BORDER_WIDTH = '1px';
const PROGRESSBAR_STYLE = css`
  display: grid;
  margin: auto;
  // max-width: 46rem;
  // background: orange;

  grid-auto-columns: 1fr;
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(3; 1fr);

  .progressbar {
    display: flex;
    flex-direction: column;
    align-items: stretch;

    .nav {
      display: table;
      flex-flow: row wrap;
      align-items: center;
      text-align: center;
      line-height: normal;
      font-style: normal;
      font-family: Lora, serif;
      color: ${BLACK};
      // background: green;

      a {
        display: table-cell;
        border-width: ${BORDER_WIDTH};
        border-color: black;
        border-style: solid;
        border-left-width: 0;
        padding: 0.85em 0em;
        min-width: 80px;
        color: black;
        cursor: pointer;
        background: ${WHITE};

        min-width: 120px;
        font-size: 0.85em;

        &:last-child {
          grid-column-start: 2;
        }

        &:first-child {
          border-left-width: ${BORDER_WIDTH};
        }

        &:hover,
        &.completed,
        &.current {
          color: white;
          background: ${OPTIMISTIC_BLUE_DARK};
        }

        &.current {
          box-shadow: inset 0 0 0px 1px #fff;
        }
      }
    }

    .progress-text {
      justify-content: flex-end;
      font-style: italic;
      font-size: 0.75rem;
      margin-top: 0.5rem;

      // .mobile {
      //   display: none;
      // }
    }
  }

  @media screen and (max-width: 540px) {
    max-width: 25.875em;

    .progressbar {
      .nav {
        a {
          overflow: hidden;
          min-width: 10px;
          padding: 0.5em 0;
          text-indent: -500px;
          line-height: 0;
        }
      }

      .progress-text {
        .mobile {
          display: inline-block;
        }
      }
    }
  }
`;
