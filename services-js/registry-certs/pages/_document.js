// @flow
/* eslint react/no-danger: 0 */
import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';

import styleTags from '../client/common/style-tags';

type Props = {
  __NEXT_DATA__: Object,
};

export default class extends Document {
  props: Props;

  constructor(props: Props) {
    super(props);

    const { __NEXT_DATA__ } = props;

    __NEXT_DATA__.webApiKey = process.env.WEB_API_KEY || 'test-api-key';
  }

  render() {
    return (
      <html lang="en" className="js flexbox">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {styleTags()}
        </Head>

        <body>
          <Main />

          <script
            src="https://d3tvtfb6518e3e.cloudfront.net/3/opbeat.min.js"
            data-org-id={process.env.OPBEAT_FRONTEND_ORGANIZATION_ID}
            data-app-id={process.env.OPBEAT_FRONTEND_APP_ID}
          />

          <NextScript />
        </body>
      </html>
    );
  }
}
