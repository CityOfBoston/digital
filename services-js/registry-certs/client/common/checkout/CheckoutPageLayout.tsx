/** @jsx jsx */

import { jsx } from '@emotion/core';

import { ReactElement, ReactNode } from 'react';

import Head from 'next/head';

import { capitalize } from '../../../lib/helpers';

import { CertificateType } from '../../types';
import { BREADCRUMB_NAV_LINKS } from '../../../lib/breadcrumbs';

import PageLayout from '../../PageLayout';
import PageWrapper, { Progress } from '../../PageWrapper';

import { SECTION_HEADING_STYLING } from '../question-components/styling';

type Props = {
  certificateType: CertificateType;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  progress?: Progress;
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
  progress,
  footer,
  children,
}: Props): ReactElement<any> {
  const breadcrumbNav = BREADCRUMB_NAV_LINKS[certificateType];
  const certificateName = `${capitalize(certificateType)} Certificates`;

  const head = (
    <Head>
      <title>
        Boston.gov — {certificateName} — {title || 'Checkout'}
      </title>
    </Head>
  );

  if (certificateType === 'death') {
    return (
      <PageLayout breadcrumbNav={breadcrumbNav}>
        {head}

        {/* We add the "no bottom padding" variant if there’s a full-width footer element to render. */}
        <div className={`b-c b-c--hsm ${footer ? 'b-c--nbp' : ''}`}>
          {title && (
            <div className="sh sh--b0">
              <h1 className="sh-title">{title}</h1>
            </div>
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
        progress={progress}
      >
        {head}
        {title && <h2 css={SECTION_HEADING_STYLING}>{title}</h2>}
        {children}
      </PageWrapper>
    );
  }
}
