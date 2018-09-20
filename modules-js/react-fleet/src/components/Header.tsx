import React from 'react';

import headerHtml from '../../templates/header.html';

export default function Header(
  props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
) {
  let className = 'h';
  if (props.className) {
    className = `${className} ${props.className}`;
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
