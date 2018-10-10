import Document, { Head, Main, NextScript } from 'next/document';
import { extractCritical } from 'emotion-server';

import { makeNProgressStyle } from '@cityofboston/next-client-common';
import { CompatibilityWarning } from '@cityofboston/react-fleet';

import { HEADER_HEIGHT } from '../client/styles';

export default class MyDocument extends Document {
  props: any;

  static getInitialProps({ renderPage, req }) {
    const page = renderPage();
    const styles = extractCritical(page.html);
    const userAgent = req.headers['user-agent'];
    return { ...page, ...styles, userAgent };
  }

  constructor(props) {
    super(props);

    const { __NEXT_DATA__, ids } = props;
    if (ids) {
      __NEXT_DATA__.ids = ids;
    }
  }

  render() {
    const { userAgent } = this.props;

    return (
      <html>
        <Head>
          <link
            rel="shortcut icon"
            href="/assets/favicon.ico"
            type="image/vnd.microsoft.icon"
          />

          <style dangerouslySetInnerHTML={{ __html: this.props.css }} />
          <style
            dangerouslySetInnerHTML={{
              __html: makeNProgressStyle(HEADER_HEIGHT),
            }}
          />
        </Head>

        <body>
          <Main />
          <CompatibilityWarning userAgent={userAgent} />
          <NextScript />
        </body>
      </html>
    );
  }
}
