// @flow

import React, { type Element as ReactElement } from 'react';
import Head from 'next/head';
import Router from 'next/router';

import {
  getDependencies,
  type ClientContext,
  type ClientDependencies,
} from '../app';
import type { DeathCertificateSearchResults } from '../types';

import AppLayout from '../AppLayout';

import Pagination from '../common/Pagination';

import SearchResult from './search/SearchResult';

type InitialProps = {|
  query: string,
  results: ?DeathCertificateSearchResults,
|};

type ContentProps = {
  ...InitialProps,
  submitSearch: string => mixed,
};

type ContentState = {
  query: string,
};

export class SearchPageContent extends React.Component<
  ContentProps,
  ContentState
> {
  constructor(props: ContentProps) {
    super(props);

    const { query } = props;

    this.state = {
      query,
    };
  }

  handleQueryChange = (ev: SyntheticInputEvent<*>) => {
    const query: string = ev.target.value;
    this.setState({ query });
  };

  handleSubmit = (ev: SyntheticInputEvent<*>) => {
    ev.preventDefault();

    const { submitSearch } = this.props;
    const { query } = this.state;

    submitSearch(query);
  };

  render() {
    const { results } = this.props;
    const { query } = this.state;

    return (
      <div>
        <Head>
          <title>Boston.gov — Death Certificates</title>
        </Head>

        <div className="p-a300">
          <div className="sh sh--b0">
            <h1 className="sh-title">Death Certificates</h1>
          </div>

          <form
            className="sf sf--md"
            acceptCharset="UTF-8"
            method="get"
            action="/death"
            onSubmit={this.handleSubmit}
          >
            <input name="utf8" type="hidden" value="✓" />

            <div className="sf-i">
              <input
                type="text"
                name="q"
                id="q"
                value={query}
                onChange={this.handleQueryChange}
                placeholder="Search…"
                className="sf-i-f"
                autoComplete="off"
              />
              <button className="sf-i-b" type="submit">
                Search
              </button>
            </div>
          </form>
        </div>

        {results && this.renderResults(results)}
        <div />
      </div>
    );
  }

  renderResults(results: DeathCertificateSearchResults) {
    // we want the query that was searched for
    const { query } = this.props;

    const start = 1 + (results.page - 1) * results.pageSize;
    const end = Math.min(start + results.pageSize - 1, results.resultCount);

    return (
      <div>
        <div className="p-a300 b--w">
          <div className="t--sans tt-u" style={{ fontSize: 12 }}>
            Showing {start}–{end} of {results.resultCount.toLocaleString()}{' '}
            results for “{query}”
          </div>
        </div>

        {results.results.map(certificate => (
          <SearchResult certificate={certificate} key={certificate.id} />
        ))}

        {results.resultCount > results.results.length &&
          this.renderPagination(results)}

        <div className="p-a300">
          Not finding what you’re looking for? Try refining your search or{' '}
          <a
            href="https://www.boston.gov/departments/registry/how-get-death-certificate"
            style={{ fontStyle: 'italic' }}
          >
            request a death certificate
          </a>.
        </div>
      </div>
    );
  }

  renderPagination({ page, pageCount }: DeathCertificateSearchResults) {
    const { query } = this.props;
    const makeHref = (p: number) => `/death?q=${query}&page=${p}`;

    return <Pagination page={page} pageCount={pageCount} hrefFunc={makeHref} />;
  }
}

export const wrapSearchPageController = (
  getDependencies: (ctx?: ClientContext) => ClientDependencies,
  renderContent: (ClientDependencies, ContentProps) => ?ReactElement<*>
) =>
  class SearchPageController extends React.Component<InitialProps> {
    static async getInitialProps(ctx: ClientContext): Promise<InitialProps> {
      const { query } = ctx;
      const { deathCertificatesDao } = getDependencies(ctx);

      let results = null;

      if (query.q) {
        results = await deathCertificatesDao.search(
          query.q,
          parseInt(query.page, 10) || 1
        );
      }

      return {
        query: query.q || '',
        results,
      };
    }

    dependencies = getDependencies();

    submitSearch = (query: string) => {
      Router.push(`/death?q=${encodeURIComponent(query)}`);
    };

    render() {
      const { submitSearch } = this;
      const { query, results } = this.props;

      return renderContent(this.dependencies, { submitSearch, query, results });
    }
  };

export default wrapSearchPageController(getDependencies, ({ cart }, props) => (
  <AppLayout navProps={{ cart, link: 'checkout' }}>
    <SearchPageContent {...props} />
  </AppLayout>
));
