import React from 'react';
import Head from 'next/head';

import { CertificateType } from '../../types';
import { DeathBreadcrumbNavLinks } from '../../death/breadcrumbs';
import { BIRTH_BREADCRUMB_NAV_LINKS } from '../../birth/constants';
import PageLayout from '../../PageLayout';
import PageWrapper, { Progress } from '../../birth/PageWrapper';
import { SECTION_HEADING_STYLING } from '../../birth/styling';

type Props = {
  certificateType: CertificateType;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
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
}: Props): React.ReactElement<any> {
  const breadcrumbNav =
    certificateType === 'death'
      ? DeathBreadcrumbNavLinks
      : BIRTH_BREADCRUMB_NAV_LINKS;

  const certificateName =
    certificateType === 'death' ? 'Death Certificates' : 'Birth Certificates';

  const head = (
    <Head>
      <title>
        Boston.gov — {certificateName} — {title || 'Checkout'}
      </title>
    </Head>
  );

  switch (certificateType) {
    case 'birth':
      return (
        <PageWrapper footer={footer} progress={progress}>
          {head}
          {title && <h2 className={SECTION_HEADING_STYLING}>{title}</h2>}
          {children}
        </PageWrapper>
      );

    case 'death':
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
  }
}
