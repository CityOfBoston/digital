import React from 'react';

import { ProgressBar } from '@cityofboston/react-fleet';

import PageLayout from '../PageLayout';

import { BIRTH_BREADCRUMB_NAV_LINKS } from './constants';

interface Progress {
  totalSteps: number;
  currentStep: number;
  currentStepCompleted: boolean;
}

interface Props {
  progress?: Progress;
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
    return (
      <PageLayout breadcrumbNav={BIRTH_BREADCRUMB_NAV_LINKS}>
        <div className="b-c b-c--nbp" aria-live="polite">
          <h1 className="sh-title">Request a birth certificate</h1>

          {this.props.progress && <ProgressBar {...this.props.progress} />}

          <section className="m-t500">{this.props.children}</section>
        </div>
      </PageLayout>
    );
  }
}
