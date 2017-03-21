// @flow

import React from 'react';
import { css } from 'glamor';
import type { Context } from 'next';
import Head from 'next/head';
import Router from 'next/router';

import type { RequestAdditions } from '../../server/next-handlers';

import Nav from '../common/Nav';
import CaseView from './CaseView';
import SearchForm from './SearchForm';

import type { Request } from '../../data/types';
import makeLoopbackGraphql from '../../data/dao/loopback-graphql';
import loadRequest from '../../data/dao/load-request';

const CONTAINER_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
});

type SearchData = {
  view: 'search',
}

type CaseData = {
  view: 'case',
  query: string,
  request: ?Request,
}

export type InitialProps = {
  data: SearchData | CaseData,
};

export default class LookupLayout extends React.Component {
  static async getInitialProps({ query, req, res }: Context<RequestAdditions>): Promise<InitialProps> {
    let data;

    if (query.q) {
      const loopbackGraphql = makeLoopbackGraphql(req);
      const request = await loadRequest(loopbackGraphql, query.q);

      if (res && !request) {
        res.statusCode = 404;
      }

      data = {
        view: 'case',
        query: query.q,
        request,
      };
    } else {
      data = { view: 'search' };
    }

    return { data };
  }

  search = async (query: string) => {
    await Router.push(`/lookup?q=${query}`);
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div className={CONTAINER_STYLE}>
        <Head>
          <title>BOS:311 — {this.renderTitle()}</title>
        </Head>

        <Nav activeSection="lookup" />

        {this.renderContent()}
      </div>
    );
  }

  renderTitle() {
    const { data } = this.props;
    switch (data.view) {
      case 'search': return 'Case Lookup';
      case 'case': {
        const { request } = data;
        if (request) {
          return `Case #${request.id}`;
        } else {
          return 'Case not found';
        }
      }
      default: return '';
    }
  }

  renderContent() {
    const { data } = this.props;

    switch (data.view) {
      case 'search':
        return (
          <SearchForm searchFunc={this.search} />
        );
      case 'case': {
        const { query, request } = data;
        return (
          <CaseView query={query} request={request} />
        );
      }
      default:
        return null;
    }
  }
}
