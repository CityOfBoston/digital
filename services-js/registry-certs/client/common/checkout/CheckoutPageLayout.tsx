/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ReactElement, ReactNode } from 'react';

import Head from 'next/head';

import {
  CHARLES_BLUE,
  ProgressBar,
  SANS,
} from '@cityofboston/react-fleet';

import { capitalize } from '../../../lib/helpers';

import { CertificateType } from '../../types';
import { BREADCRUMB_NAV_LINKS } from '../../../lib/breadcrumbs';

import PageLayout from '../../PageLayout';
import PageWrapper from '../../PageWrapper';
import { ProgressProps } from '../../../lib/interfaces';

import { SECTION_HEADING_STYLING } from '../question-components/styling';

type Props = {
  certificateType: CertificateType;
  title?: string;
  /** Death flow: main page title above the progress bar */
  pageTitle?: string;
  /** Death flow: section heading below the progress bar */
  sectionTitle?: string;
  currentStep?: number;
  totalSteps?: number;
  children?: ReactNode;
  footer?: ReactNode;
  progress?: ProgressProps;
};

/**
 * Wrapper around PageLayout that adds in certificate-type appropriate
 * breadcrumbs, title, and header.
 *
 * Pass an element in the footer prop to render it in a full-width section below
 * the centered main content div.
 */
export default function CheckoutPageLayout({
  certificateType,
  title,
  pageTitle,
  sectionTitle,
  currentStep,
  totalSteps = 7,
  footer,
  children,
}: Props): ReactElement<any> {
  const breadcrumbNav = BREADCRUMB_NAV_LINKS[certificateType];
  const certificateName = `${capitalize(certificateType)} Certificates`;
  const documentTitle = sectionTitle || title || 'Checkout';

  const head = (
    <Head>
      <title>
        Boston.gov — {certificateName} — {documentTitle}
      </title>
    </Head>
  );

  if (certificateType === 'death') {
    const useDeathFlowChrome =
      !!pageTitle || !!sectionTitle || typeof currentStep === 'number';

    return (
      <PageLayout breadcrumbNav={breadcrumbNav}>
        {head}

        {/* We add the "no bottom padding" variant if there’s a full-width footer element to render. */}
        <div
          className={`b-c ${footer ? 'b-c--nbp' : ''} ${
            useDeathFlowChrome ? '' : 'b-c--hsm'
          }`}
          css={useDeathFlowChrome ? DEATH_PAGE_STYLING : undefined}
        >
          {useDeathFlowChrome ? (
            <>
              <h1 css={DEATH_PAGE_TITLE_STYLING}>
                {pageTitle || 'Request a death certificate'}
              </h1>

              {typeof currentStep === 'number' && (
                <div css={DEATH_PROGRESS_WRAP_STYLING}>
                  <ProgressBar
                    totalSteps={totalSteps}
                    currentStep={currentStep}
                    currentStepCompleted
                  />
                </div>
              )}

              {(sectionTitle || title) && (
                <h2 css={DEATH_SECTION_TITLE_STYLING}>
                  {sectionTitle || title}
                </h2>
              )}
            </>
          ) : (
            title && (
              <div className="sh sh--b0">
                <h1 className="sh-title">{title}</h1>
              </div>
            )
          )}

          {children}
        </div>

        {footer}
      </PageLayout>
    );
  } else {
    return (
      <PageWrapper
        certificateType={certificateType}
        footer={footer}
        noHeadline={true}
      >
        {head}
        {title && <h2 css={SECTION_HEADING_STYLING}>{title}</h2>}
        {children}
      </PageWrapper>
    );
  }
}

const DEATH_PAGE_STYLING = css({
  maxWidth: '45rem',
});

const DEATH_PAGE_TITLE_STYLING = css({
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '2rem',
  lineHeight: 1.2,
  textTransform: 'uppercase',
  color: CHARLES_BLUE,
  margin: '0 0 1.5rem',
});

const DEATH_PROGRESS_WRAP_STYLING = css({
  marginBottom: '2rem',
});

const DEATH_SECTION_TITLE_STYLING = css({
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1.875rem',
  lineHeight: 1.2,
  textTransform: 'uppercase',
  color: CHARLES_BLUE,
  margin: '0 0 1.5rem',
});
