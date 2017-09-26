// @flow

import React, { type Element as ReactElement } from 'react';

import headerHtml from '../templates/header.html';
import navigationHtml from '../templates/navigation.html';
import footerHtml from '../templates/footer.html';

type Props = {|
  children: () => ReactElement<*>,
|};

export default function AppLayout({ children: render }: Props) {
  // TODO(fin): remove wrapper <div> and return an array w/ React 16
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

      <div className="mn mn--full mn--nv-s" style={{ zIndex: 2 }}>
        <input type="checkbox" id="s-tr" className="s-tr" aria-hidden="true" />
        <header
          className="h"
          role="banner"
          dangerouslySetInnerHTML={{ __html: headerHtml }}
        />

        {render()}
      </div>

      <footer
        className="ft"
        style={{ position: 'relative', zIndex: 2 }}
        dangerouslySetInnerHTML={{ __html: footerHtml }}
      />
    </div>
  );
}
