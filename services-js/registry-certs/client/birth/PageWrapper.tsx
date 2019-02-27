import React from 'react';
import { css } from 'emotion';

import { ProgressBar, MEDIA_X_LARGE } from '@cityofboston/react-fleet';

import PageLayout from '../PageLayout';

import { BIRTH_BREADCRUMB_NAV_LINKS } from './constants';

export interface Progress {
  totalSteps: number;
  currentStep: number;
  currentStepCompleted: boolean;
}

interface Props {
  progress?: Progress;
  footer?: React.ReactNode;
}

/**
 * Convenience component for freestanding pages.
 *
 * Progress bar should only be shown if user is in the request flow;
 * VerifyPage can be accessed outside of the request flow: user could be
 * directed there by a Registry employee
 */
export default class PageWrapper extends React.Component<Props> {
  render() {
    const { progress, footer, children } = this.props;

    return (
      <PageLayout breadcrumbNav={BIRTH_BREADCRUMB_NAV_LINKS}>
        <div
          className={`b-c b-c--hsm ${footer ? 'b-c--nbp' : ''}`}
          aria-live="polite"
        >
          <h1 className={`sh-title ${TITLE_STYLE}`}>
            Request a birth certificate
          </h1>

          {progress && <ProgressBar {...progress} />}

          <section className="m-t500">{children}</section>
        </div>

        {footer}
      </PageLayout>
    );
  }
}

const TITLE_STYLE = css({
  [MEDIA_X_LARGE]: {
    // We put a hard top limit on the size, since with the responsive sizes on
    // sh-title the phrase "Request a birth certificate" gets too big and wraps
    // past 1245px wide.
    fontSize: 38,
  },
});
