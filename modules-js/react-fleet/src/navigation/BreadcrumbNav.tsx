import React, { ReactNode } from 'react';
import { css } from 'emotion';

import { FREEDOM_RED } from '../utilities/constants';

export interface Link {
  url: string;
  text: string;
}

interface Props {
  parentLinks: Link[];
  currentPage: ReactNode | string;
  className?: string;
}

const ADJUST_NAV_STYLE = css({
  // boston.gov drupal side of things is calling a legacy stylesheet with font smoothing applied
  '-webkit-font-smoothing': 'antialiased',
  '-moz-osx-font-smoothing': 'grayscale',
});

const LAST_BREADCRUMB_STYLE = css({
  color: FREEDOM_RED,
});

/**
 * Breadcrumb navigation for use in Boston.gov web applications.
 *
 * Starts with a “Home” link to https://www.boston.gov, followed by any parent
 * links for the current page.
 *
 * If a string value is passed in for currentPage, a link will be created with
 * currentPage as the text and the window.location.href as the url.
 *
 * Otherwise, any element may be passed in for currentPage. Note: it is good
 * practice to add “aria-current="page"” to the <a> element that will be
 * passed in.
 *
 * https://www.w3.org/TR/wai-aria-practices/#breadcrumb
 */
export default function BreadcrumbNav(props: Props): JSX.Element {
  const visualSeparator: JSX.Element = (
    <span className="brc-s" style={{ cursor: 'default' }} aria-hidden="true">
      {' '}
      ›{' '}
    </span>
  );

  function currentPageLink(): JSX.Element {
    return (
      <a
        href={window.location.href}
        className={LAST_BREADCRUMB_STYLE}
        aria-current="page"
      >
        {props.currentPage}
      </a>
    );
  }

  return (
    <nav
      className={`brc ${ADJUST_NAV_STYLE} ${props.className}`}
      aria-label="Breadcrumbs"
    >
      <ul className="brc-l">
        <li className="brc-l-i">
          <a href="https://www.boston.gov/">Home</a>

          {visualSeparator}
        </li>

        {props.parentLinks.map(link => (
          <li className="brc-l-i" key={link.url}>
            <a href={link.url}>{link.text}</a>

            {visualSeparator}
          </li>
        ))}

        <li className="brc-l-i">
          {typeof props.currentPage === 'string'
            ? currentPageLink()
            : props.currentPage}
        </li>
      </ul>
    </nav>
  );
}
