import React from 'react';
import Head from 'next/head';

import { CertificateType } from '../../types';
import { DeathBreadcrumbNavLinks } from '../../death/breadcrumbs';
import { BIRTH_BREADCRUMB_NAV_LINKS } from '../../birth/constants';
import PageLayout from '../../PageLayout';

type Props = {
  certificateType: CertificateType;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
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
  footer,
  children,
}: Props): React.ReactElement<any> {
  const breadcrumbNav =
    certificateType === 'death'
      ? DeathBreadcrumbNavLinks
      : BIRTH_BREADCRUMB_NAV_LINKS;

  const certificateName =
    certificateType === 'death' ? 'Death Certificates' : 'Birth Certificates';

  return (
    <PageLayout breadcrumbNav={breadcrumbNav}>
      {/* We add the "no bottom padding" variant if there’s a full-width footer element to render. */}
      <div className={`b-c b-c--hsm ${footer ? 'b-c--nbp' : ''}`}>
        <Head>
          <title>
            Boston.gov — {certificateName} — {title || 'Checkout'}
          </title>
        </Head>

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
