import Document, { Head, Main, NextScript } from 'next/document';
import { extractCritical } from 'emotion-server';

import { makeNProgressStyle } from '@cityofboston/next-client-common';
import { HEADER_HEIGHT } from '../client/styles';

export default class MyDocument extends Document {
  props: any;

  static getInitialProps({ renderPage }) {
    const page = renderPage();
    const styles = extractCritical(page.html);
    return { ...page, ...styles };
  }

  constructor(props) {
    super(props);

    const { __NEXT_DATA__, ids } = props;
    if (ids) {
      __NEXT_DATA__.ids = ids;
    }
  }

  render() {
    return (
      <html>
        <Head>
          <style dangerouslySetInnerHTML={{ __html: this.props.css }} />
          <style
            dangerouslySetInnerHTML={{
              __html: makeNProgressStyle(HEADER_HEIGHT),
            }}
          />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
