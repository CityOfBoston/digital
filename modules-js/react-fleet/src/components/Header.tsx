import React, { useEffect } from 'react';

import headerHtml from '../../templates/header.html';

/**
 * Common header element for City of Boston React applications.
 *
 * When the City Seal is visible in the header, it will slide up halfway out of
 * view when a user scrolls past ~310px. When the user has scrolled back to the
 * top of the document, the seal will slide back to its original position.
 */
export default function Header(
  props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
) {
  let className = 'h';

  if (props.className) {
    className = `${className} ${props.className}`;
  }

  useEffect(() => {
    let timer;

    const handleScroll = (): void => {
      if (timer) {
        window.clearTimeout(timer);
      }

      // Add or remove the CSS class once the user has stopped scrolling
      timer = window.setTimeout(() => handleScrollStop(), 750);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  function handleScrollStop(): void {
    const sealElement = document.getElementById('seal');

    if (!isSealVisible()) {
      return;
    }

    if (sealElement) {
      if (window.scrollY > 310) {
        sealElement.classList.add('s--u');
      } else {
        sealElement.classList.remove('s--u');
      }
    }
  }

  return (
    <>
      <input type="checkbox" id="s-tr" className="s-tr" aria-hidden="true" />
      <header
        role="banner"
        {...props}
        className={className}
        dangerouslySetInnerHTML={{ __html: headerHtml }}
      />
    </>
  );
}

/**
 * The City Seal is only visible at the widest breakpoints, but always exists
 * in the DOM.
 */
function isSealVisible(): boolean {
  const sealElement = document.getElementById('seal');
  const sealElementDisplay = sealElement
    ? window.getComputedStyle(sealElement).getPropertyValue('display')
    : null;

  return !!(sealElement && sealElementDisplay !== 'none');
}
