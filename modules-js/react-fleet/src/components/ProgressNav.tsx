/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useState } from 'react';

import {
  BLACK,
  WHITE,
  OPTIMISTIC_BLUE_DARK,
  GRAY_200,
} from '../utilities/constants';

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
  disableOnEnd?: boolean;
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
    disableOnEnd,
    totalSteps,
  } = props;
  const [focused, setFocus] = useState<number>(currentStep);
  const stepElem = (step: string, key: number, index: any) => {
    const completedCss =
      index && index.indexOf(key) > -1 ? `completed` : `uncompleted`;
    const focusedCss = currentStep === key ? ` focused` : ` `;
    const formDone = completed && completed.length === totalSteps;
    const doneCss = formDone ? ` done` : ``;
    const disableCss =
      disableOnEnd && disableOnEnd === true ? ` disabled` : ` `;
    const currentCss = key === index[index.length - 1] ? `current` : ``;
    const set_Focus =
      index && index.indexOf(key) > -1 && !formDone
        ? () => setFocus(key)
        : () => {};
    const evalCurrStep = steps.length - 1;
    const blockStepBack =
      typeof blockStepBackAfterLastNav === 'undefined' ||
      (blockStepBackAfterLastNav && blockStepBackAfterLastNav === true);
    const on_Click =
      index &&
      index.indexOf(key) > -1 &&
      currentStep < evalCurrStep &&
      blockStepBack
        ? () => clickHandler(key)
        : e => e.preventDefault();
    let linkParam = {
      key: key,
      title: `${step}`,
      onClick: on_Click,
      'aria-label': `${step}`,
      className: `${completedCss}${focusedCss}${disableCss}${currentCss}${doneCss}`,
    };
    if (formDone) {
      linkParam['onTouchMove'] = set_Focus;
      linkParam['onMouseEnter'] = set_Focus;
    }
    const $link = (
      <a {...Object.assign({}, linkParam)}>
        {step}
        <span className="arrow" />
      </a>
    );
    return $link;
  };

  const currStepCount =
    offset && typeof offset === 'number' ? currentStep + offset : currentStep;
  const progressText = () => {
    return <span>{`Step ${currStepCount + 1} of ${steps.length}`}</span>;
  };

  const mobileText = () => {
    const showStepNameCss =
      showStepName && showStepName === true ? `` : `mobile`;
    return (
      <span className={`${showStepNameCss}`}>
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
          {mobileText()}
        </div>
      </div>
    </div>
  );
}

const BORDER_WIDTH = '1px';
const PROGRESSBAR_STYLE = css`
  display: grid;
  margin: auto;
  margin-top: 0.75rem;
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
        &.current,
        &.focused {
          color: white;
          cursor: pointer;
          background: ${OPTIMISTIC_BLUE_DARK};
        }

        &.focused,
        &.completed:hover {
          box-shadow: inset 0 0 0px 1px #fff;
        }

        &.current,
        &.completed .current,
        &.completed .focused .current {
          color: ${BLACK};
          background: ${WHITE};
        }

        &.uncompleted,
        &.done,
        &.done:hover {
          color: ${BLACK};
          background: ${GRAY_200};
        }

        &.done,
        &.done:hover {
          cursor: default;
        }
      }
    }

    .progress-text {
      justify-content: flex-end;
      font-style: italic;
      font-size: 1rem;
      margin-top: 0.5rem;
      // background-color: purple;

      .mobile {
        // background-color: red;
        display: none;
      }
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
