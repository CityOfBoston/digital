// @flow
/* eslint react/no-danger: 0 */

import React from 'react';

import stylesheetHrefs from '../templates/stylesheets.json';

export default function makeCss(css: ?string) {
  const publicCssHref = stylesheetHrefs.find((href) => href.match(/public\.css/));
  const otherCssHrefs = stylesheetHrefs.filter((href) => !href.match(/public\.css/));

  return [
    ...otherCssHrefs.map((href) => (
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
            <script src="/assets/vendor/ie9-polyfill.js"></script>
            <link href="${publicCssHref.replace('public', 'ie')}" rel="stylesheet" type="text/css">
          <![endif]-->`,
      }}
    />,

    <link key="mapbox" href="https://api.mapbox.com/mapbox.js/v3.0.1/mapbox.css" rel="stylesheet" />,
    <link key="mapbox-gl" href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.37.0/mapbox-gl.css" rel="stylesheet" />,

    <style type="text/css" key="default">{`
      body {
        color: #58585B;
        font-family: Lora, serif;
      }

      img, svg {
        max-width: 100%;
        height: auto;
        width: auto;
      }

      #nprogress{pointer-events:none;}
      #nprogress .bar{background:#fcb61a;position:fixed;z-index:1031;top:0;left:0;width:100%;height:2px;}
      #nprogress .peg{display:block;position:absolute;right:0px;width:100px;height:100%;box-shadow:0 0 10px #fcb61a,0 0 5px #fcb61a;opacity:1.0;-webkit-transform:rotate(3deg) translate(0px,-4px);-ms-transform:rotate(3deg) translate(0px,-4px);transform:rotate(3deg) translate(0px,-4px);}
      #nprogress .spinner{display:block;position:fixed;z-index:1031;top:15px;right:15px;}
      #nprogress .spinner-icon{width:18px;height:18px;box-sizing:border-box;border:solid 2px transparent;border-top-color:#fcb61a;border-left-color:#fcb61a;border-radius:50%;-webkit-animation:nprogress-spinner 400ms linear infinite;animation:nprogress-spinner 400ms linear infinite;}
      .nprogress-custom-parent{overflow:hidden;position:relative;}
      .nprogress-custom-parent #nprogress .spinner,.nprogress-custom-parent #nprogress .bar{position:absolute;}

      @-webkit-keyframes nprogress-spinner{0%{-webkit-transform:rotate(0deg);}100%{-webkit-transform:rotate(360deg);}}
      @keyframes nprogress-spinner{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
    `}</style>,

    css && <style type="text/css" key="static" dangerouslySetInnerHTML={{ __html: css }} />,
  ];
}
