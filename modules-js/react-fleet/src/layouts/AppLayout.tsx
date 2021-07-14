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

          <div
            role="article"
            about="/city-boston-technical-issues"
            className="node-11562371 node clearfix node-site-alert modstate-published b b--dark-blue b--fw"
          >
            <div className="b-c b-c--xsmv fyi--dark-blue">
              <div className="fyi-c">
                <div className="fyi-t fyi-t--dark-blue">
                  <div>
                    <div className="field field-name-title-field field-type-text field-type-string field-label-hidden field-items">
                      <div>CITY OF BOSTON TECHNICAL ISSUES</div>
                    </div>
                  </div>
                </div>

                <div className="fyi-s fyi-s--dark-blue">/</div>

                <div className="fyi-d fyi-d--dark-blue">
                  We're currently experiencing technical issues with some of our
                  systems, including our applications for ordering birth,
                  marriage, and death certificates. We're working to resolve
                  these issues now.
                </div>
              </div>
            </div>
          </div>

          <div id="content-start" className="a11y--content-start" />

          <main className="b-ff">{children}</main>
        </div>
      </div>

      <Footer style={{ position: 'relative', zIndex: 2 }} />
    </>
  );
}
