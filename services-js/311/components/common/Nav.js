import React from 'react';

import Link from 'next/link';

export type Props = {
  activeSection: 'report' | 'lookup' | 'go' | 'faq',
}

function renderNavItem({ href, as, title }, active) {
  return (
    <li className="nv-s-l-i">
      <Link href={href} as={as}>
        <a className={`nv-s-l-a ${active ? 'nv-s-l-a--active' : ''}`}>
          {title}
        </a>
      </Link>
    </li>
  );
}

export default function Nav({ activeSection }: Props) {
  return (
    <nav className="nv-s nv-s--y">
      <input type="checkbox" id="nv-s-tr" className="nv-s-tr" aria-hidden />

      <ul className="nv-s-l">
        <li className="nv-s-l-i">
          <label htmlFor="nv-s-tr" className="nv-s-l-b" type="button">Navigation</label>
        </li>

        { renderNavItem({ href: '/report', as: '/', title: 'Report a problem' }, activeSection === 'report')}
        { renderNavItem({ href: '/lookup', title: 'Case look up' }, activeSection === 'lookup')}
        { renderNavItem({ href: '/go', title: '311 on the go' }, activeSection === 'go')}
        { renderNavItem({ href: '/faq', title: 'FAQ' }, activeSection === 'faq')}
      </ul>
    </nav>
  );
}
