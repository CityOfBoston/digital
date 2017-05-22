// @flow
/* eslint react/no-danger: 0 */
import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import { renderStatic } from 'glamor/server';
import mobxReact from 'mobx-react';

import styleTags from '../client/common/style-tags';

import headerHtml from '../templates/header.html';
import footerHtml from '../templates/footer.html';
import navigationHtml from '../templates/navigation.html';

type Props = {
  __NEXT_DATA__: Object,
  glamorIds: string[],
  css: string,
};

export default class extends Document {
  props: Props;

  static async getInitialProps({ renderPage }) {
    let page;

    const { ids, css } = renderStatic(() => {
      mobxReact.useStaticRendering(true);

      page = renderPage();

      return page.html;
    });

    return {
      ...page,
      glamorIds: ids,
      css,
    };
  }

  constructor(props: Props) {
    super(props);

    const { __NEXT_DATA__, glamorIds } = props;

    __NEXT_DATA__.glamorIds = glamorIds;
    __NEXT_DATA__.webApiKey = process.env.WEB_API_KEY;
  }

  render() {
    const { css } = this.props;

    return (
      <html lang="en" className="js flexbox">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {styleTags(css)}
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
        </body>
      </html>
    );
  }
}
