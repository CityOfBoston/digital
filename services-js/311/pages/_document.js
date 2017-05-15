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
          {makeCss(css)}
        </Head>

        <body>
          <input type="checkbox" id="brg-tr" className="brg-tr" aria-hidden="true" />
          <nav className="nv-m" dangerouslySetInnerHTML={{ __html: navigationHtml }} />

          <div className="a11y--h" aria-live="polite" id="ariaLive" />

          <div className="mn mn--full mn--nv-s" style={{ zIndex: 2 }}>
            <input type="checkbox" id="s-tr" className="s-tr" aria-hidden="true" />
            <header className="h" role="banner" dangerouslySetInnerHTML={{ __html: headerHtml }} />

            <Main />
          </div>

          <footer className="ft" style={{ position: 'relative', zIndex: 2 }} dangerouslySetInnerHTML={{ __html: footerHtml }} />

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
