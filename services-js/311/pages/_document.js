// @flow
/* eslint react/no-danger: 0 */
import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import { renderStatic } from 'glamor/server';
import mobxReact from 'mobx-react';

import makeCss from '../lib/make-css';

import headerHtml from '../templates/header.html';
import footerHtml from '../templates/footer.html';
import navigationHtml from '../templates/navigation.html';

type Props = {
  __NEXT_DATA__: Object,
  ids: string[],
  css: string,
};

export default class extends Document {
  props: Props;

  static async getInitialProps({ renderPage }) {
    const page = renderPage();
    const styles = renderStatic(() => page.html);
    return {
      ...page,
      ...styles,
    };
  }

  constructor(props: Props) {
    super(props);

    mobxReact.useStaticRendering(true);

    const { __NEXT_DATA__, ids } = props;
    if (ids) {
      __NEXT_DATA__.ids = this.props.ids;
    }

    __NEXT_DATA__.webApiKey = process.env.WEB_API_KEY;
  }

  render() {
    const { css } = this.props;

    return (
      <html lang="en" className="js flexbox">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{ __html: `
              var _rollbarConfig = {
                accessToken: "${process.env.ROLLBAR_CLIENT_KEY || ''}",
                captureUncaught: true,
                enabled: ${((process.env.NODE_ENV || 'development') !== 'development').toString()},
                payload: {
                  environment: "${process.env.HEROKU_PIPELINE || process.env.NODE_ENV || 'development'}"
                }
              };
              !function(r){function e(t){if(o[t])return o[t].exports;var n=o[t]={exports:{},id:t,loaded:!1};return r[t].call(n.exports,n,n.exports,e),n.loaded=!0,n.exports}var o={};return e.m=r,e.c=o,e.p="",e(0)}([function(r,e,o){"use strict";var t=o(1).Rollbar,n=o(2);_rollbarConfig.rollbarJsUrl=_rollbarConfig.rollbarJsUrl||"https://d37gvrvc0wt4s1.cloudfront.net/js/v1.9/rollbar.min.js";var a=t.init(window,_rollbarConfig),i=n(a,_rollbarConfig);a.loadFull(window,document,!_rollbarConfig.async,_rollbarConfig,i)},function(r,e){"use strict";function o(r){return function(){try{return r.apply(this,arguments)}catch(e){try{console.error("[Rollbar]: Internal error",e)}catch(o){}}}}function t(r,e,o){window._rollbarWrappedError&&(o[4]||(o[4]=window._rollbarWrappedError),o[5]||(o[5]=window._rollbarWrappedError._rollbarContext),window._rollbarWrappedError=null),r.uncaughtError.apply(r,o),e&&e.apply(window,o)}function n(r){var e=function(){var e=Array.prototype.slice.call(arguments,0);t(r,r._rollbarOldOnError,e)};return e.belongsToShim=!0,e}function a(r){this.shimId=++c,this.notifier=null,this.parentShim=r,this._rollbarOldOnError=null}function i(r){var e=a;return o(function(){if(this.notifier)return this.notifier[r].apply(this.notifier,arguments);var o=this,t="scope"===r;t&&(o=new e(this));var n=Array.prototype.slice.call(arguments,0),a={shim:o,method:r,args:n,ts:new Date};return window._rollbarShimQueue.push(a),t?o:void 0})}function l(r,e){if(e.hasOwnProperty&&e.hasOwnProperty("addEventListener")){var o=e.addEventListener;e.addEventListener=function(e,t,n){o.call(this,e,r.wrap(t),n)};var t=e.removeEventListener;e.removeEventListener=function(r,e,o){t.call(this,r,e&&e._wrapped?e._wrapped:e,o)}}}var c=0;a.init=function(r,e){var t=e.globalAlias||"Rollbar";if("object"==typeof r[t])return r[t];r._rollbarShimQueue=[],r._rollbarWrappedError=null,e=e||{};var i=new a;return o(function(){if(i.configure(e),e.captureUncaught){i._rollbarOldOnError=r.onerror,r.onerror=n(i);var o,a,c="EventTarget,Window,Node,ApplicationCache,AudioTrackList,ChannelMergerNode,CryptoOperation,EventSource,FileReader,HTMLUnknownElement,IDBDatabase,IDBRequest,IDBTransaction,KeyOperation,MediaController,MessagePort,ModalWindow,Notification,SVGElementInstance,Screen,TextTrack,TextTrackCue,TextTrackList,WebSocket,WebSocketWorker,Worker,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload".split(",");for(o=0;o<c.length;++o)a=c[o],r[a]&&r[a].prototype&&l(i,r[a].prototype)}return e.captureUnhandledRejections&&(i._unhandledRejectionHandler=function(r){var e=r.reason,o=r.promise,t=r.detail;!e&&t&&(e=t.reason,o=t.promise),i.unhandledRejection(e,o)},r.addEventListener("unhandledrejection",i._unhandledRejectionHandler)),r[t]=i,i})()},a.prototype.loadFull=function(r,e,t,n,a){var i=function(){var e;if(void 0===r._rollbarPayloadQueue){var o,t,n,i;for(e=new Error("rollbar.js did not load");o=r._rollbarShimQueue.shift();)for(n=o.args,i=0;i<n.length;++i)if(t=n[i],"function"==typeof t){t(e);break}}"function"==typeof a&&a(e)},l=!1,c=e.createElement("script"),p=e.getElementsByTagName("script")[0],d=p.parentNode;c.crossOrigin="",c.src=n.rollbarJsUrl,c.async=!t,c.onload=c.onreadystatechange=o(function(){if(!(l||this.readyState&&"loaded"!==this.readyState&&"complete"!==this.readyState)){c.onload=c.onreadystatechange=null;try{d.removeChild(c)}catch(r){}l=!0,i()}}),d.insertBefore(c,p)},a.prototype.wrap=function(r,e){try{var o;if(o="function"==typeof e?e:function(){return e||{}},"function"!=typeof r)return r;if(r._isWrap)return r;if(!r._wrapped){r._wrapped=function(){try{return r.apply(this,arguments)}catch(e){throw"string"==typeof e&&(e=new String(e)),e._rollbarContext=o()||{},e._rollbarContext._wrappedSource=r.toString(),window._rollbarWrappedError=e,e}},r._wrapped._isWrap=!0;for(var t in r)r.hasOwnProperty(t)&&(r._wrapped[t]=r[t])}return r._wrapped}catch(n){return r}};for(var p="log,debug,info,warn,warning,error,critical,global,configure,scope,uncaughtError,unhandledRejection".split(","),d=0;d<p.length;++d)a.prototype[p[d]]=i(p[d]);r.exports={Rollbar:a,_rollbarWindowOnError:t}},function(r,e){"use strict";r.exports=function(r,e){return function(o){if(!o&&!window._rollbarInitialized){var t=window.RollbarNotifier,n=e||{},a=n.globalAlias||"Rollbar",i=window.Rollbar.init(n,r);i._processShimQueue(window._rollbarShimQueue||[]),window[a]=i,window._rollbarInitialized=!0,t.processPayloads()}}}}]);
          ` }}
          />
          {makeCss(css)}
        </Head>

        <body>
          <input type="checkbox" id="brg-tr" className="brg-tr" aria-hidden="true" />
          <nav className="nv-m" dangerouslySetInnerHTML={{ __html: navigationHtml }} />

          <div className="a11y--h" aria-live="polite" id="ariaLive" />

          <div className="mn mn--full mn--nv-s">
            <input type="checkbox" id="s-tr" className="s-tr" aria-hidden="true" />
            <header className="h" role="banner" dangerouslySetInnerHTML={{ __html: headerHtml }} />

            <Main />
          </div>

          <footer className="ft" style={{ position: 'relative', zIndex: 1 }} dangerouslySetInnerHTML={{ __html: footerHtml }} />

          <script
            src="https://d3tvtfb6518e3e.cloudfront.net/3/opbeat.min.js"
            data-org-id={process.env.OPBEAT_ORGANIZATION_ID}
            data-app-id={process.env.OPBEAT_APP_ID}
          />

          <NextScript />

          <script src={process.env.LIVE_AGENT_SCRIPT_SRC} />
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{ __html: `
              (function() {
                var buttonId = "${process.env.LIVE_AGENT_BUTTON_ID || ''}";
                // We need to make a fake "showWhenOnline" in order to get
                // button events from the server. All of the app showing/hiding
                // is done though addButtonEventHandler because Live Agent does
                // not support adding new buttons after init is called, which
                // runs against what we need in a single-page app.
                liveagent.showWhenOnline(buttonId, document.createElement('DIV'));
                liveagent.addButtonEventHandler(buttonId, function(event) {
                  window.LIVE_AGENT_AVAILABLE = event === 'BUTTON_AVAILABLE';
                });
                liveagent.init("${process.env.LIVE_AGENT_CHAT_URL || ''}", "${process.env.LIVE_AGENT_ORG_ID || ''}", "${process.env.LIVE_AGENT_DEPLOYMENT_ID || ''}");
              })();
            ` }}
          />
        </body>
      </html>
    );
  }
}
