/* eslint react/display-name: 0 */

import React, { KeyboardEvent, MouseEvent } from 'react';
import Link from 'next/link';
import { css } from 'emotion';

const headerHtml: string = require('../templates/header.html');
const navigationHtml: string = require('../templates/navigation.html');
const footerHtml: string = require('../templates/footer.html');

import Nav from './common/Nav';
import DeathCertificateCart from './store/DeathCertificateCart';

import { FREEDOM_RED } from './common/style-constants';

// These props only require a Cart if showNav is true. Discriminated unions FTW.
type Props =
  | {
      showNav?: false;
    }
  | {
      showNav: true;
      cart: DeathCertificateCart;
    };

const LAST_BREADCRUMB_STYLE = css({
  color: FREEDOM_RED,
});

const AppLayout: React.StatelessComponent<Props> = props => (
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
        className={`mn mn--full ${props.showNav ? 'mn--nv-s' : ''}`}
        style={{ zIndex: 2 }}
      >
        <input type="checkbox" id="s-tr" className="s-tr" aria-hidden="true" />
        <header
          className="h"
          role="banner"
          dangerouslySetInnerHTML={{ __html: headerHtml }}
        />

        {props.showNav && <Nav cart={props.cart} />}

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
                <a className={LAST_BREADCRUMB_STYLE}>Death certificates</a>
              </Link>
            </li>
          </ul>
        </nav>

        <div id="content-start" className="a11y--content-start" />
        <main className="b-ff">{props.children}</main>
      </div>
    </div>

    <footer
      className="ft"
      style={{ position: 'relative', zIndex: 2 }}
      dangerouslySetInnerHTML={{ __html: footerHtml }}
    />
  </div>
);
export default AppLayout;
