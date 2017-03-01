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
          <p className="skip-link__wrapper">
            <a href="#main-menu" className="skip-link visually-hidden--focusable" id="skip-link">Jump to navigation</a>
          </p>

          <input type="checkbox" id="hb__trigger" className="hb__trigger" aria-hidden="true" />
          <div className="main-navigation" dangerouslySetInnerHTML={{ __html: navigationHtml }} />

          <div className="page" id="page">
            <header className="header" role="banner" dangerouslySetInnerHTML={{ __html: headerHtml }} />
            <Main />
            <footer className="ft" dangerouslySetInnerHTML={{ __html: footerHtml }} />

          </div>
          <NextScript />
        </body>
      </html>
    );
  }
}
