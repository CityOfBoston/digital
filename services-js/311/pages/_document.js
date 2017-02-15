/* eslint react/no-danger: 0 */
import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';

export default class extends Document {
  render() {
    return (
      <html lang="en">
        <Head>
          <link href="https://fonts.googleapis.com/css?family=Lora:400,400i|Montserrat:400,700" rel="stylesheet" />
          <link rel="stylesheet" type="text/css" href="https://patterns.boston.gov/css/public.css" />

          <style type="text/css">{`
            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden
            }

            * {
              box-sizing: border-box
            }
          `}</style>
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
