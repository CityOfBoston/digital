// @flow
/* eslint react/no-danger: 0 */
import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import { renderStatic } from 'glamor/server';

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
    return (
      <html lang="en">
        <Head>
          <link href="https://fonts.googleapis.com/css?family=Lora:400,400i|Montserrat:400,700" rel="stylesheet" />
          <link rel="stylesheet" type="text/css" href="https://patterns.boston.gov/css/public.css" />

          <style type="text/css">{`
            /* Add any new styles here to storybook/head.html as well */
            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
              font-family: Montserrat, Arial, sans-serif;
            }

            * {
              box-sizing: border-box
            }
          `}</style>

          <style dangerouslySetInnerHTML={{ __html: this.props.css }} />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
