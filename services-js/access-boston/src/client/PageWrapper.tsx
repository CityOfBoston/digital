/** @jsx jsx */

import { jsx, css } from '@emotion/core';

import { Component, ReactNode } from 'react';

import { ProgressBar } from '@cityofboston/react-fleet';

// import PageLayout from './PageLayout';

export interface Progress {
  totalSteps: number;
  currentStep: number;
  currentStepCompleted: boolean;
  offset?: number | undefined;
}

interface Props {
  progress?: Progress;
  footer?: ReactNode;
  classString?: string;
  mainHeadline?: string;
  offset?: number;
}

/**
 * Convenience component for freestanding pages.
 */
export default class PageWrapper extends Component<Props> {
  render() {
    const {
      progress,
      footer,
      children,
      classString,
      mainHeadline,
      offset,
    } = this.props;
    const sec2ndClassStr = footer ? 'b-c--nbp' : '';
    const classStr =
      classString && classString.length > 0
        ? `${classString}${sec2ndClassStr}`
        : `b-c--hsm ${sec2ndClassStr}`;

    const $mainHeadline =
      mainHeadline && mainHeadline.length > 0
        ? mainHeadline
        : `Identity Verification Process`;

    let modProgress = Object.assign({}, progress);
    if (offset && typeof offset === 'number') {
      modProgress.offset = offset;
    }

    return (
      <>
        <div className={classStr} aria-live="polite">
          {mainHeadline && mainHeadline.length > 0 && (
            <h1 className="sh-title">{$mainHeadline}</h1>
          )}

          {progress && (
            <div css={PROGRESSBAR_WRAPPER_STYLING}>
              <ProgressBar {...modProgress} />
            </div>
          )}

          {children}
        </div>

        {footer}
      </>
    );
  }
}

const PROGRESSBAR_WRAPPER_STYLING = css({
  marginTop: '1.5em',
  marginBottom: '2.0em',
});
