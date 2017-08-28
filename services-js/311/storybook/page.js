// @flow
/* eslint react/no-danger: 0 */

import * as React from 'react';

import headerHtml from '../templates/header.html';
import footerHtml from '../templates/footer.html';
import navigationHtml from '../templates/navigation.html';

function Page({ children }: { children: React.Node }) {
  return (
    <div>
      <input
        type="checkbox"
        id="brg-tr"
        className="brg-tr"
        aria-hidden="true"
      />
      <nav
        className="nv-m"
        dangerouslySetInnerHTML={{ __html: navigationHtml }}
      />

      <div className="a11y--h" aria-live="polite" id="ariaLive" />

      <div className="mn mn--full mn--full-vc mn--nv-s" style={{ zIndex: 2 }}>
        <input type="checkbox" id="s-tr" className="s-tr" aria-hidden="true" />
        <header
          className="h"
          role="banner"
          dangerouslySetInnerHTML={{ __html: headerHtml }}
        />

        {children}
      </div>

      <footer
        className="ft"
        style={{ position: 'relative', zIndex: 2 }}
        dangerouslySetInnerHTML={{ __html: footerHtml }}
      />
    </div>
  );
}

export default function page(stories: () => React.Node) {
  return (
    <Page>
      {stories()}
    </Page>
  );
}
