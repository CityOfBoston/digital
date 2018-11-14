// @flow

import React from 'react';
import footerHtml from '../../templates/footer.html';

export default function Footer() {
  return (
    <footer
      className="ft"
      style={{ position: 'relative', zIndex: 2 }}
      dangerouslySetInnerHTML={{ __html: footerHtml }}
    />
  );
}
