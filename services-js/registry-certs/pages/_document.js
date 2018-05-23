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

          {/* short-term fix for https://github.com/ionic-team/stencil/issues/606 */}
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
            if (!Array.prototype.find) {
              Object.defineProperty(Array.prototype, 'find', {
                writable: true,
                value: function(predicate) {
                 // 1. Let O be ? ToObject(this value).
                  if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                  }
            
                  var o = Object(this);
            
                  // 2. Let len be ? ToLength(? Get(O, "length")).
                  var len = o.length >>> 0;
            
                  // 3. If IsCallable(predicate) is false, throw a TypeError exception.
                  if (typeof predicate !== 'function') {
                    throw new TypeError('predicate must be a function');
                  }
            
                  // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
                  var thisArg = arguments[1];
            
                  // 5. Let k be 0.
                  var k = 0;
            
                  // 6. Repeat, while k < len
                  while (k < len) {
                    // a. Let Pk be ! ToString(k).
                    // b. Let kValue be ? Get(O, Pk).
                    // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                    // d. If testResult is true, return kValue.
                    var kValue = o[k];
                    if (predicate.call(thisArg, kValue, k, o)) {
                      return kValue;
                    }
                    // e. Increase k by 1.
                    k++;
                  }
            
                  // 7. Return undefined.
                  return undefined;
                }
              });
            }
            
            `,
            }}
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
