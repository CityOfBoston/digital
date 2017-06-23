// @flow
/* eslint react/no-danger: 0 */

import React from 'react';

import headerHtml from '../templates/header.html';

export default function FullPageDecorator(next: Function) {
  return (
    <div className="mn mn--full mn--nv-s">
      <header
        className="h"
        role="banner"
        dangerouslySetInnerHTML={{ __html: headerHtml }}
      />
      {next()}
    </div>
  );
}
