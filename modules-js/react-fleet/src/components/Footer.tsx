import React from 'react';

import footerHtml from '../../templates/footer.html';

export default function Footer(
  props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
) {
  let className = 'ft';
  if (props.className) {
    className = `${className} ${props.className}`;
  }

  return (
    <footer
      {...props}
      className={className}
      dangerouslySetInnerHTML={{ __html: footerHtml }}
    />
  );
}
