// @flow
/* eslint react/display-name: 0 */

import React, {
  type Element as ReactElement,
  type ChildrenArray as ReactChildrenArray,
} from 'react';

import headerHtml from '../templates/header.html';
import navigationHtml from '../templates/navigation.html';
import footerHtml from '../templates/footer.html';

import type { ClientDependencies } from './app';
import Nav, { type Props as NavProps, type LinkOptions } from './common/Nav';

type Props = {|
  children: ReactChildrenArray<ReactElement<*>>,
  navProps: NavProps,
|};

export default function AppLayout({ children, navProps }: Props) {
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

        <Nav {...navProps} />

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

export const wrapAppLayout = <P>(
  navLink: LinkOptions,
  render: (ClientDependencies, P) => ReactElement<*>
) => (dependencies: ClientDependencies, props: P) => (
  <AppLayout navProps={{ cart: dependencies.cart, link: navLink }}>
    {render(dependencies, props)}
  </AppLayout>
);
