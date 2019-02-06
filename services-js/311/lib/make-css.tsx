import React from 'react';

import { DEFAULT_TEXT, SERIF } from '@cityofboston/react-fleet';

import stylesheetHrefs from '../templates/stylesheets.json';
import { assetUrl } from '../components/style-constants';

type CssOpts = {
  cacheParam?: string;
  additionalCss?: string;
};

export default function makeCss(opts: CssOpts = {}) {
  const { cacheParam, additionalCss } = opts;

  const cacheBustedCssHrefs = stylesheetHrefs.map(
    href => (cacheParam ? `${href}?k=${cacheParam}` : href)
  );
  const publicCssHref = cacheBustedCssHrefs.find(
    href => !!href.match(/public\.css/)
  )!;
  const otherCssHrefs = cacheBustedCssHrefs.filter(
    href => !href.match(/public\.css/)
  );

  return [
    ...otherCssHrefs.map(href => (
      <link href={href} key={href} type="text/css" rel="stylesheet" />
    )),

    <head
      key="conditional-style"
      dangerouslySetInnerHTML={{
        __html: `
          <!--[if !IE]><!-->
            <link href="${publicCssHref}" type="text/css" rel="stylesheet" />
          <!--<![endif]-->
          <!--[if lt IE 10]>
            <script src="${assetUrl('vendor/ie9-polyfill.js')}"></script>
            <link href="${publicCssHref.replace(
              'public',
              'ie'
            )}" rel="stylesheet" type="text/css">
          <![endif]-->`,
      }}
    />,

    <link
      key="mapbox"
      href="https://api.mapbox.com/mapbox.js/v3.0.1/mapbox.css"
      rel="stylesheet"
    />,

    <style type="text/css" key="default">{`
      body {
        color: ${DEFAULT_TEXT};
        font-family: ${SERIF};
        /* leave space for the fixed banner */
        padding-bottom: 30px;
      }

      header #seal {
        display: none;
      }

      img, svg {
        max-width: 100%;
        height: auto;
        width: auto;
      }

      #nprogress{pointer-events:none;}
      #nprogress .bar{background:rgba(252,182,26,.7);position:fixed;z-index:1031;top:0;left:0;width:100%;height:65px;}
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
