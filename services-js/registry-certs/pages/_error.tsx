/* eslint react/no-danger: 0, no-underscore-dangle: 0 */

// Forked from next.js to add Opbeat error sending

import React, { CSSProperties } from 'react';
import HTTPStatus from 'http-status';
import Head from 'next/head';
import { ClientContext } from '../client/app';

const ERROR_STYLE: CSSProperties = {
  color: '#000',
  background: '#fff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif',
  height: '100vh',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const DESC_STYLE: CSSProperties = {
  display: 'inline-block',
  textAlign: 'left',
  lineHeight: '49px',
  height: '49px',
  verticalAlign: 'middle',
};

const HEADER_STYLE: CSSProperties = {
  display: 'inline-block',
  borderRight: '1px solid rgba(0, 0, 0,.3)',
  margin: 0,
  marginRight: '20px',
  padding: '10px 23px 10px 0',
  fontSize: '24px',
  fontWeight: 500,
  verticalAlign: 'top',
};

const SUBHEADER_STYLE: CSSProperties = {
  fontSize: '14px',
  fontWeight: 'normal',
  margin: 0,
  padding: 0,
};

type Props = {
  statusCode: number;
};

export default class Error extends React.Component<Props> {
  static getInitialProps({ res, err }: ClientContext) {
    const errStatusCode = err ? err.statusCode : null;
    const statusCode = res ? res.statusCode : errStatusCode;

    if (
      (process as any).browser &&
      (window as any).Rollbar &&
      err &&
      !err._reportedException
    ) {
      (window as any).Rollbar.error(err);
      err._reportedException = true;
    }

    return { statusCode };
  }

  render() {
    const { statusCode } = this.props;
    const title =
      statusCode === 404
        ? 'This page could not be found'
        : HTTPStatus[statusCode] || 'An unexpected error has occurred';

    return (
      <div style={ERROR_STYLE}>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>

        <div>
          <style dangerouslySetInnerHTML={{ __html: 'body { margin: 0 }' }} />
          {statusCode ? <h1 style={HEADER_STYLE}>{statusCode}</h1> : null}
          <div style={DESC_STYLE}>
            <h2 style={SUBHEADER_STYLE}>{title}.</h2>
          </div>
        </div>
      </div>
    );
  }
}
