import React from 'react';

import headerHtml from '../../templates/header.html';

export default function Header(
  props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
) {
  let className = 'h';
  let isScrolling;

  if (props.className) {
    className = `${className} ${props.className}`;
  }

  // When the City seal is visible in the header, it should slide halfway out
  // of view when a user scrolls past ~310px. When scrolling back towards the
  // top, the seal should slide back to its original position.
  function handleScroll(): void {
    window.clearTimeout(isScrolling);

    isScrolling = window.setTimeout(() => handleScrollStop(), 1000);
  }

  function handleScrollStop(): void {
    const sealElement = document.getElementById('seal');

    if (sealElement && isSealVisible()) {
      if (window.pageYOffset > 310) {
        sealElement.classList.add('s--u');
      } else {
        sealElement.classList.remove('s--u');
      }
    } else {
      // The listener is unnecessary if the seal is not visible, so remove it.
      window.removeEventListener('scroll', handleScroll);
    }
  }

  window.addEventListener('scroll', handleScroll);

  // Ensure that seal show/hide behavior is present, even in cases where the
  // seal was not visible on initial page load, and the user resizes their
  // browser window large enough that the seal will be visible.
  window.addEventListener('resize', () => {
    if (isSealVisible()) {
      window.addEventListener('scroll', handleScroll);
    }
  });

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

function isSealVisible(): boolean {
  const sealElement = document.getElementById('seal');
  const sealElementDisplay = sealElement
    ? window.getComputedStyle(sealElement).getPropertyValue('display')
    : null;

  return !!(sealElement && sealElementDisplay !== 'none');
}
