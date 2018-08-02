/* eslint react/display-name: 0 */

import React, { KeyboardEvent, MouseEvent } from 'react';
import Link from 'next/link';

const headerHtml: string = require('../templates/header.html');
const navigationHtml: string = require('../templates/navigation.html');
const footerHtml: string = require('../templates/footer.html');

import Nav from './common/Nav';

interface Props {
  showNav?: boolean;
}

const AppLayout: React.StatelessComponent<Props> = ({ children, showNav }) => (
  <div>
    <a
      href="#content-start"
      tabIndex={1}
      className="btn a11y--h a11y--f"
      style={{ margin: 4 }}
      onClick={(ev: MouseEvent<HTMLAnchorElement>) => ev.currentTarget.blur()}
    >
      Jump to content
    </a>

    <input
      type="checkbox"
      id="brg-tr"
      className="brg-tr"
      aria-label="Open Boston.gov menu"
      onKeyDown={(ev: KeyboardEvent<HTMLInputElement>) => {
        if (ev.key === 'Tab' && !ev.shiftKey && !ev.currentTarget.checked) {
          const a = document.querySelector('header a') as HTMLAnchorElement;
          a && a.focus();
          ev.preventDefault();
        }
      }}
    />
    <nav
      className="nv-m"
      dangerouslySetInnerHTML={{ __html: navigationHtml }}
      aria-label="Boston.gov menu"
    />

    <div className="mn--full-ie">
      <div
        className={`mn mn--full ${showNav ? 'mn--nv-s' : ''}`}
        style={{ zIndex: 2 }}
      >
        <input type="checkbox" id="s-tr" className="s-tr" aria-hidden="true" />
        <header
          className="h"
          role="banner"
          dangerouslySetInnerHTML={{ __html: headerHtml }}
        />

        {showNav && <Nav />}

        <nav className="brc p-a300" aria-label="Breadcrumbs">
          <ul className="brc-l">
            <li className="brc-l-i">
              <a href="https://www.boston.gov/">Home</a>
              <span className="brc-s"> › </span>
            </li>
            <li className="brc-l-i">
              <a href="https://www.boston.gov/departments">Departments</a>
              <span className="brc-s"> › </span>
            </li>
            <li className="brc-l-i">
              <a href="https://www.boston.gov/departments/registry">
                Registry: Birth, death, and marriage
              </a>
              <span className="brc-s"> › </span>
            </li>
            <li className="brc-l-i">
              <Link href="/death">
                <a>Death certificates</a>
              </Link>
            </li>
          </ul>
        </nav>

        <div id="content-start" className="a11y--content-start" />
        <main className="b-ff">{children}</main>
      </div>
    </div>

    <footer
      className="ft"
      style={{ position: 'relative', zIndex: 2 }}
      dangerouslySetInnerHTML={{ __html: footerHtml }}
    />

    <style jsx>{`
      .brc li:last-child a {
        color: #fb4d42;
      }
    `}</style>
  </div>
);
export default AppLayout;
