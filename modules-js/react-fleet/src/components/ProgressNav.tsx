/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useState } from 'react';

import {
  BLACK,
  WHITE,
  OPTIMISTIC_BLUE_DARK,
  GRAY_200,
  SANS,
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
    const formDone = completed && completed.length === totalSteps;
    let cssObj = {
      completedCss:
        index && index.indexOf(key) > -1 ? `completed` : `uncompleted`,
      focusedCss: currentStep === key ? `focused` : ``,
      doneCss: formDone ? `done` : ``,
      disableCss: disableOnEnd && disableOnEnd === true ? `disabled` : ``,
      currentCss: key === index[index.length - 1] ? `current` : ``,
    };

    // Filter out object key/value with empty strings eq. ``
    Object.keys(cssObj).forEach(k => cssObj[k] == '' && delete cssObj[k]);

    // Output obj values as string of classNames
    let cssArrToString: string = Object.keys(cssObj)
      .map(obj => cssObj[obj])
      .toString()
      .replace(/,/g, ' ');

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
        : (e: { preventDefault: () => void }) => e.preventDefault();
    let linkParam = {
      key: key,
      title: `${step}`,
      onClick: on_Click,
      'aria-label': `${step}`,
      className: `${cssArrToString}`,
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

  grid-auto-columns: 1fr;
  grid-auto-rows: 1fr;
  // grid-template-columns: repeat(3; 1fr);

  .progressbar {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: stretch;

    .nav {
      display: table;
      table-layout: fixed;
      text-align: center;
      line-height: normal;
      font-style: normal;
      font-weight: bold;
      font-family: ${SANS};
      text-transform: uppercase;
      color: '#58585B';

      a {
        display: table-cell;
        border-width: ${BORDER_WIDTH};
        border-color: black;
        border-style: solid;
        border-left-width: 0;
        padding: 0.85em 0.5em;
        color: black;
        background: ${WHITE};
        width: 2%;
        font-size: 0.85em;
        vertical-align: middle;

        &:last-child {
          grid-column-start: 2;
        }

        &:first-child {
          border-left-width: ${BORDER_WIDTH};
        }

        &.completed,
        &.completed.current {
          cursor: pointer;
          color: ${WHITE};
          background: ${OPTIMISTIC_BLUE_DARK};
        }

        &.uncompleted {
          background: ${GRAY_200};
        }

        &.completed.focused.current {
          color: ${BLACK};
          cursor: pointer;
          background: #f2f2f2;
        }

        &.completed.focused,
        &.completed:hover {
          color: ${BLACK};
          cursor: pointer;
          background: #b0d9ff;
        }

        &.done,
        &.done:hover,
        &.completed.focused.done.current {
          color: ${BLACK};
          cursor: default;
          background: #f2f2f2;
        }

        &.completed.current {
          color: ${BLACK};
          background: #f2f2f2;
        }
      }
    }

    .progress-text {
      justify-content: flex-end;
      font-style: italic;
      font-size: 1rem;
      margin-top: 0.5rem;

      .mobile {
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

  @media (min-width: 541px) and (max-width: 1024px) {
    .progressbar {
      .nav {
        a {
          padding: 0.85em 0;
          font-size: 0.55rem;
        }
      }
    }
  }
`;
