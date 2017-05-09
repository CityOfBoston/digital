// @flow

import React from 'react';
import type { Context } from 'next';
import Head from 'next/head';

import type { RequestAdditions } from '../../server/next-handlers';

import Nav from '../common/Nav';
import CaseView from './CaseView';

import type { Request } from '../../data/types';
import type { AppStore } from '../../data/store';
import makeLoopbackGraphql from '../../data/dao/loopback-graphql';
import loadRequest from '../../data/dao/load-request';

type CaseData = {|
  request: ?Request,
|}

export type InitialProps = {|
  data: CaseData,
|};

export type Props = {|
  /* :: ...InitialProps, */
  store: AppStore,
|}

export default class ReportsLayout extends React.Component {
  props: Props;

  static async getInitialProps({ query, req, res }: Context<RequestAdditions>): Promise<InitialProps> {
    const { id } = query;

    const loopbackGraphql = makeLoopbackGraphql(req);
    const request = await loadRequest(loopbackGraphql, id);

    if (res && !request) {
      res.statusCode = 404;
    }

    const data = {
      request,
    };

    return { data };
  }

  render() {
    const { store, data } = this.props;

    return (
      <div>
        <Head>
          <title>BOS:311 — {this.renderTitle()}</title>
        </Head>

        <Nav />

        <div role="main">
          { data.request && <CaseView request={data.request} store={store} /> }
        </div>
      </div>
    );
  }

  renderTitle() {
    const request = this.props.data.request;

    if (request) {
      return `Case #${request.id}`;
    } else {
      return 'Case not found';
    }
  }
}
