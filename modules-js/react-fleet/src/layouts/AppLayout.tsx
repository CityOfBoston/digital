import React, { MouseEvent, ReactNode } from 'react';

import Header from '../components/Header';
import Menu from '../components/Menu';
import Footer from '../components/Footer';

export interface Props {
  secondaryNav?: ReactNode;
  breadcrumbNav?: ReactNode;
  children?: ReactNode;
}

/**
 * Standard layout component to frame freestanding React web applications and
 * seamlessly match with all other pages on the Boston.gov site.
 *
 * Provides a skip link to main content and Boston.gov site navigation,
 * header, and footer.
 *
 * Includes options to pass in a secondary navigation component, as well as
 * the breadcrumb navigation component.
 */
export default function AppLayout({
  secondaryNav,
  breadcrumbNav,
  children,
}: Props) {
  return (
    <>
      <a
        href="#content-start"
        tabIndex={1}
        className="btn a11y--h a11y--f"
        style={{ margin: 4 }}
        onClick={(ev: MouseEvent<HTMLAnchorElement>) => ev.currentTarget.blur()}
      >
        Jump to content
      </a>

      <Menu />

      <div className="mn--full-ie">
        <div className={`mn mn--full ${secondaryNav ? 'mn--nv-s' : ''}`}>
          <Header />

          {secondaryNav}

          {secondaryNav ? (
            <>{breadcrumbNav}</>
          ) : (
            <div className="p-t300">{breadcrumbNav}</div>
          )}

          <div id="content-start" className="a11y--content-start" />

          <main className="b-ff">{children}</main>
        </div>
      </div>

      <Footer style={{ position: 'relative', zIndex: 2 }} />
    </>
  );
}
