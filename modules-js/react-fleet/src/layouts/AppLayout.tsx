import React, { ReactNode } from 'react';

import Header from '../components/Header';
import Menu from '../components/Menu';
import Footer from '../components/Footer';

export interface Props {
  nav?: ReactNode;
  children?: ReactNode;
}

export default function AppLayout({ nav, children }: Props) {
  // TODO(fin): remove wrapper <div> and return an array w/ React 16
  return (
    <div>
      <a
        href="#content-start"
        tabIndex={1}
        className="btn a11y--h a11y--f"
        style={{ margin: 4 }}
        onClick={ev => ev.currentTarget.blur()}
      >
        Jump to content
      </a>

      <Menu />

      <div className="mn--full-ie">
        <div className={`mn mn--full ${nav ? 'mn--nv-s' : ''}`}>
          <Header />

          {nav}

          <div id="content-start" className="a11y--content-start" />

          <main className="b-ff">{children}</main>
        </div>
      </div>

      <Footer style={{ position: 'relative', zIndex: 2 }} />
    </div>
  );
}
