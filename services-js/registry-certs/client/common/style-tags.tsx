/* eslint react/no-danger: 0 */

import React from 'react';

import stylesheetHrefs from '../../templates/stylesheets.json';

interface CssOpts {
  cacheParam?: string;
  additionalCss?: string;
}

export default function styleTags(opts: CssOpts = {}) {
  const { cacheParam, additionalCss } = opts;

  const cacheBustedCssHrefs = stylesheetHrefs.map(
    href => (cacheParam ? `${href}?k=${cacheParam}` : href)
  );

  return [
    ...cacheBustedCssHrefs.map(href => (
      <link href={href} key={href} type="text/css" rel="stylesheet" />
    )),

    <style type="text/css" key="default">{`
      body {
        color: #58585B;
      }

      #nprogress{pointer-events:none;}
      #nprogress .bar{background:rgba(40,139,228,.7);position:fixed;z-index:1031;top:0;left:0;width:100%;height:65px;}
    `}</style>,

    additionalCss && (
      <style
        type="text/css"
        key="static"
        dangerouslySetInnerHTML={{ __html: additionalCss }}
      />
    ),
  ];
}
