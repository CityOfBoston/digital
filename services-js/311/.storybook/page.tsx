import React, { ReactNode } from 'react';

import headerHtml from '../templates/header.html';
import navigationHtml from '../templates/navigation.html';

type Props = {
  children: ReactNode;
};

function Page({ children }: Props) {
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
    </div>
  );
}

export default function page(stories: () => ReactNode) {
  return <Page>{stories()}</Page>;
}
