import React from 'react';
import { css } from 'emotion';

import { FREEDOM_RED_DARK } from '../utilities/constants';

export interface Link {
  url: string;
  text: string;
}

interface Props {
  parentLinks: Link[];
  currentPage: Link;
  className?: string;
}

const ADJUST_NAV_STYLE = css({
  // boston.gov drupal side of things is calling a legacy stylesheet with font smoothing applied
  '-webkit-font-smoothing': 'antialiased',
  '-moz-osx-font-smoothing': 'grayscale',
});

const LAST_BREADCRUMB_STYLE = css({
  color: FREEDOM_RED_DARK,
});

/**
 * Breadcrumb navigation for use in Boston.gov web applications.
 *
 * Starts with a “Home” link to https://www.boston.gov, followed by any parent
 * links for the current page, and then the link for the current page.
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
          <a
            href={props.currentPage.url}
            className={LAST_BREADCRUMB_STYLE}
            aria-current="page"
          >
            {props.currentPage.text}
          </a>
        </li>
      </ul>
    </nav>
  );
}
