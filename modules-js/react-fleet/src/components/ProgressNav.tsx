/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useState } from 'react';

import { BLACK, WHITE, OPTIMISTIC_BLUE_DARK } from '../utilities/constants';

interface Props {
  steps: Array<string>;
  totalSteps?: number;
  currentStep: number;
  currentStepCompleted?: boolean;
  showStepName?: boolean;
  offset?: number;
  completed?: Array<number>;
  clickHandler?: any;
  lastCompletedStepIndex?: number;
  blockStepBackAfterLastNav?: boolean;
}

export default function ProgressNav(props: Props): JSX.Element {
  const {
    steps,
    currentStep,
    showStepName,
    offset,
    completed,
    clickHandler,
    blockStepBackAfterLastNav,
  } = props;
  const [focused, setFocus] = useState<number>(currentStep);
  // const setFocus = key => console.log(`setFocus(${key})`);
  // const focused = currentStep;

  const stepElem = (step: string, key: number, completed: any) => {
    const completedCss =
      completed && completed.indexOf(key) > -1 ? `completed` : ``;
    const currentCss = currentStep === key ? `current` : ``;
    const set_Focus =
      completed && completed.indexOf(key) > -1 ? () => setFocus(key) : () => {};
    // const clickConsoleStd = () => void console.log(`Clicked ${steps[key]}`);
    // const evalOffset = offset && typeof offset === 'boolean' ? offset : 0;
    const evalCurrStep = steps.length - 1;
    const elem = (
      <a
        key={key}
        title={`${step}`}
        onClick={
          completed && completed.indexOf(key) > -1 && currentStep < evalCurrStep
            ? () => {
                {
                  clickHandler(key);
                  console.log(
                    `blockStepBackAfterLastNav | currentStep: ${blockStepBackAfterLastNav} - step: ${currentStep} - key: ${key}`
                  );
                }
              }
            : () => {}
        }
        aria-label={`${step}`}
        className={`${completedCss} ${currentCss}`}
        onTouchMove={set_Focus}
        onMouseEnter={set_Focus}
      >
        {step}
        <span className="arrow" />
      </a>
    );
    console.log(
      `blockStepBackAfterLastNav | currentStep: ${blockStepBackAfterLastNav} - ${currentStep} - ${currentStep -
        1}`
    );
    return elem;
  };

  const currStepCount =
    offset && typeof offset === 'number' ? currentStep + offset : currentStep;
  const progressText = () => {
    return <span>{`Step ${currStepCount + 1} of ${steps.length}`}</span>;
  };

  const mobileText = () => {
    return (
      <span className="mobile">
        {`: `} {steps[focused]}
      </span>
    );
  };

  return (
    <div css={PROGRESSBAR_STYLE}>
      <div className="progressbar">
        <div className="nav">
          {steps &&
            steps.map((step, index) => stepElem(step, index, completed))}
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
        background: ${WHITE};

        min-width: 120px;
        font-size: 0.85em;

        &:last-child {
          grid-column-start: 2;
        }

        &:first-child {
          border-left-width: ${BORDER_WIDTH};
        }

        &.completed,
        &.completed:hover,
        &.current {
          color: white;
          cursor: pointer;
          background: ${OPTIMISTIC_BLUE_DARK};
        }

        &.current,
        &.completed:hover {
          box-shadow: inset 0 0 0px 1px #fff;
        }
      }
    }

    .progress-text {
      justify-content: flex-end;
      font-style: italic;
      font-size: 1rem;
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
