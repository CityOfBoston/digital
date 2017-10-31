// @flow
/* eslint react/no-danger: 0 */
import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import { extractCritical } from 'emotion-server';

import mobxReact from 'mobx-react';

import makeCss from '../lib/make-css';

import headerHtml from '../templates/header.html';
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
    const styles = extractCritical(page.html || page.errorHtml);

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
    __NEXT_DATA__.contactForm = {
      url: process.env.CONTACT_FORM_URL,
      token: process.env.CONTACT_FORM_TOKEN,
    };
    __NEXT_DATA__.assetPrefix =
      process.env.ASSET_HOST && process.env.ASSET_HOST !== '.'
        ? `https://${process.env.ASSET_HOST}`
        : '';
  }

  render() {
    const { css } = this.props;

    return (
      <html lang="en" className="js flexbox">
        <Head>
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="apple-mobile-web-app-title" content="BOS:311" />
          <link
            rel="shortcut icon"
            type="image/png"
            href="/assets/icons/favicon-96x96.png"
          />

          <link
            rel="apple-touch-icon"
            href="/assets/icons/apple-icon-57x57.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="114x114"
            href="/assets/icons/apple-icon-114x114.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="120x120"
            href="/assets/icons/apple-icon-120x120.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="152x152"
            href="/assets/icons/apple-icon-152x152.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/assets/icons/apple-icon-180x180.png"
          />

          <link
            rel="icon"
            sizes="192x192"
            href="/assets/icons/android-icon-192x192.png"
          />

          {makeCss(css)}

          {process.env.GOOGLE_TRACKING_ID &&
            <script
              type="text/javascript"
              dangerouslySetInnerHTML={{
                __html: `
              (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
              (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
              m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
              })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

              ga('create', '${process.env.GOOGLE_TRACKING_ID}', 'auto', {
                siteSpeedSampleRate: 10,
              });
              ga('send', 'pageview');
          `,
              }}
            />}
        </Head>

        <body>
          <input
            type="checkbox"
            id="brg-tr"
            className="brg-tr"
            aria-hidden="true"
          />
          <nav
            className="nv-m"
            dangerouslySetInnerHTML={{ __html: navigationHtml }}
          />

          <div className="a11y--h" aria-live="polite" id="ariaLive" />

          <div className="mn mn--full mn--nv-s" style={{}}>
            <input
              type="checkbox"
              id="s-tr"
              className="s-tr"
              aria-hidden="true"
            />
            <header
              className="h"
              role="banner"
              dangerouslySetInnerHTML={{ __html: headerHtml }}
            />

            <Main />
          </div>

          <script
            src="https://d3tvtfb6518e3e.cloudfront.net/3/opbeat.min.js"
            data-org-id={process.env.OPBEAT_FRONTEND_ORGANIZATION_ID}
            data-app-id={process.env.OPBEAT_FRONTEND_APP_ID}
          />

          <NextScript />

          <script src={process.env.LIVE_AGENT_SCRIPT_SRC} />
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
              (function() {
                if (typeof liveagent === 'undefined') {
                  return;
                }

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
                liveagent.init("${process.env.LIVE_AGENT_CHAT_URL ||
                  ''}", "${process.env.LIVE_AGENT_ORG_ID || ''}", "${process.env
                .LIVE_AGENT_DEPLOYMENT_ID || ''}");
              })();
            `,
            }}
          />
        </body>
      </html>
    );
  }
}
