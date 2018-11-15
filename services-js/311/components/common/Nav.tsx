import React from 'react';
import Link from 'next/link';

type Props = {
  activeSection?: 'request' | 'services' | 'search' | 'faq' | null;
};

type NavItemAttributes = {
  href: string;
  as: string | undefined;
  title: string;
};

function renderNavItem({ href, as, title }: NavItemAttributes, active) {
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
  let key: string | undefined;

  if (typeof window !== 'undefined') {
    // we use the current location as a key to force a complete re-render
    // on location change, which resets the checkbox to unchecked, closing
    // the dropdown
    key = window.location.href;
  }

  return (
    <nav className="nv-s nv-s--y nv-s--sticky" key={key}>
      <input type="checkbox" id="nv-s-tr" className="nv-s-tr" aria-hidden />

      <ul className="nv-s-l">
        <li className="nv-s-l-i">
          <label htmlFor="nv-s-tr" className="nv-s-l-b">
            Navigation
          </label>
        </li>

        {renderNavItem(
          { href: '/request', as: '/', title: 'BOS:311 Home' },
          activeSection === 'request'
        )}
        {renderNavItem(
          { href: '/search', as: undefined, title: 'Search cases' },
          activeSection === 'search'
        )}
        {renderNavItem(
          { href: '/services', as: undefined, title: 'All services' },
          activeSection === 'services'
        )}
        {renderNavItem(
          { href: '/faq', as: undefined, title: 'FAQ' },
          activeSection === 'faq'
        )}
      </ul>
    </nav>
  );
}
