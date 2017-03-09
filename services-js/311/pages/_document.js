// @flow
/* eslint react/no-danger: 0 */
import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import { renderStatic } from 'glamor/server';

import makeCssHead from '../lib/make-css-head';

import headerHtml from '../templates/header.html';
import footerHtml from '../templates/footer.html';
import navigationHtml from '../templates/navigation.html';

type Props = {
  __NEXT_DATA__: Object,
  ids: string[],
  css: string,
};

export default class extends Document {
  static async getInitialProps({ renderPage }) {
    const page = renderPage();
    const styles = renderStatic(() => page.html);
    return { ...page, ...styles };
  }

  constructor(props: Props) {
    super(props);

    const { __NEXT_DATA__, ids } = props;
    if (ids) {
      __NEXT_DATA__.ids = this.props.ids;
    }
  }

  render() {
    const { css } = this.props;

    return (
      <html lang="en" className="js flexbox">
        { makeCssHead(Head, css) }

        <body>
          <nav className="nv-m" dangerouslySetInnerHTML={{ __html: navigationHtml }} />
          <input type="checkbox" id="brg-tr" className="brg-tr" aria-hidden="true" />

          <div className="mn">
            <input type="checkbox" id="s-tr" className="s-tr" aria-hidden="true" />
            <header className="h" role="banner" dangerouslySetInnerHTML={{ __html: headerHtml }} />
            <Main />
            <footer className="ft" dangerouslySetInnerHTML={{ __html: footerHtml }} />

          </div>
          <NextScript />
        </body>
      </html>
    );
  }
}
