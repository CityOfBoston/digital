// @flow
/* eslint react/no-danger: 0 */
import React from 'react';
import type { DocumentContext } from 'next';
import Document, { Head, Main, NextScript } from 'next/document';
import flush from 'styled-jsx/server';

import styleTags from '../client/common/style-tags';

type Props = {
  __NEXT_DATA__: Object,
  cacheParam: string,
};

export default class extends Document {
  props: Props;

  static getInitialProps({ renderPage }: DocumentContext<*>) {
    const page = renderPage();

    // Need this for styled-jsx styles to appear in server-rendered content.
    const styles = flush();

    // This is set by our standard deployment process.
    const cacheParam =
      (process.env.GIT_REVISION && process.env.GIT_REVISION.substring(0, 8)) ||
      Math.random()
        .toString(36)
        .substr(2, 5);

    return { ...page, styles, cacheParam };
  }

  constructor(props: Props) {
    super(props);

    const { __NEXT_DATA__ } = props;

    __NEXT_DATA__.webApiKey = process.env.WEB_API_KEY || 'test-api-key';
    __NEXT_DATA__.stripePublishableKey =
      process.env.STRIPE_PUBLISHABLE_KEY || 'fake-stripe-key';
  }

  render() {
    const { cacheParam } = this.props;

    return (
      <html lang="en" className="js flexbox">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link
            rel="shortcut icon"
            href="/assets/favicon.ico"
            type="image/vnd.microsoft.icon"
          />

          {styleTags({ cacheParam })}

          {process.env.GOOGLE_TRACKING_ID && (
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
              ga('require', 'ec');
          `,
              }}
            />
          )}
        </Head>

        <body>
          <div className="a11y--h" aria-live="polite" id="ariaLive" />

          <Main />

          <script
            src="https://d3tvtfb6518e3e.cloudfront.net/3/opbeat.min.js"
            data-org-id={process.env.OPBEAT_FRONTEND_ORGANIZATION_ID}
            data-app-id={process.env.OPBEAT_FRONTEND_APP_ID}
          />

          <script
            src={`${process.env.WEB_COMPONENTS_URI ||
              'https://patterns.boston.gov/web-components/all.js'}?k=${cacheParam}`}
          />

          <script src="https://js.stripe.com/v3/" />

          <NextScript />

          <cob-contact-form
            id="contactForm"
            default-subject="Death Certificates Feedback"
            token={process.env.CONTACT_FORM_TOKEN}
            {...(process.env.CONTACT_FORM_ACTION
              ? { action: process.env.CONTACT_FORM_ACTION }
              : {})}
          />
        </body>
      </html>
    );
  }
}
