import React from 'react';

import { ProgressBar } from '@cityofboston/react-fleet';

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
  public componentDidMount(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

  render() {
    const { progress, footer, children } = this.props;

    return (
      <PageLayout breadcrumbNav={BIRTH_BREADCRUMB_NAV_LINKS}>
        <div
          className={`b-c b-c--hsm ${footer ? 'b-c--nbp' : ''}`}
          aria-live="polite"
        >
          <h1 className="sh-title">Request a birth certificate</h1>

          {progress && <ProgressBar {...progress} />}

          <section className="m-t500">{children}</section>
        </div>

        {footer}
      </PageLayout>
    );
  }
}
