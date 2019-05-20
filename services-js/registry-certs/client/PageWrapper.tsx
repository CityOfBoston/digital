/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { Component, ReactNode } from 'react';

import {
  ProgressBar,
  // MEDIA_LARGE,
  // MEDIA_SMALL,
  MEDIA_X_LARGE,
} from '@cityofboston/react-fleet';

import PageLayout from './PageLayout';

import { BREADCRUMB_NAV_LINKS } from '../lib/breadcrumbs';

type CertificateRequestType = 'birth' | 'marriage';

export interface Progress {
  totalSteps: number;
  currentStep: number;
  currentStepCompleted: boolean;
}

interface Props {
  certificateType: CertificateRequestType;
  progress?: Progress;
  footer?: ReactNode;
}

/**
 * Convenience component for freestanding pages.
 *
 * Used for Birth and Marriage certificate requests.
 */
export default class PageWrapper extends Component<Props> {
  render() {
    const { certificateType, progress, footer, children } = this.props;

    return (
      <PageLayout breadcrumbNav={BREADCRUMB_NAV_LINKS[certificateType]}>
        <div
          className={`b-c b-c--hsm ${footer ? 'b-c--nbp' : ''}`}
          aria-live="polite"
        >
          <h1 className="sh-title" css={titleStyle(certificateType)}>
            Request a {certificateType} certificate
          </h1>

          {progress && <ProgressBar {...progress} />}

          <section className="m-t500">{children}</section>
        </div>

        {footer}
      </PageLayout>
    );
  }
}

// We put a hard top limit on the size, since with the responsive sizes on
// sh-title the phrase “Request a birth certificate” gets too big and wraps
// past 1245px wide. Since “marriage” contains more characters, the max font
// size is dropped to 34px.
function titleStyle(type: CertificateRequestType) {
  const styling = {
    paddingRight: 0,
    [MEDIA_X_LARGE]: {
      fontSize: type === 'birth' ? 38 : 34,
    },
  };

  // todo: adjust sizing further for Marriage
  // const isMarriage =
  //   type === 'marriage'
  //     ? { fontSize: 16, [MEDIA_SMALL]: { fontSize: 22 }, [MEDIA_LARGE]: { fontSize: 25 } }
  //     : null;

  return css({
    // ...isMarriage,
    ...styling,
  });
}
