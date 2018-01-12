// @flow

import React from 'react';
import Head from 'next/head';
import Router from 'next/router';

import {
  getDependencies,
  type ClientContext,
  type ClientDependencies,
} from '../../app';
import type { DeathCertificateSearchResults } from '../../types';

import AppLayout from '../../AppLayout';

import Pagination from '../../common/Pagination';

import SearchResult from './SearchResult';

type Props = {|
  query: string,
  page: number,
  results: ?DeathCertificateSearchResults,
|};

type State = {
  query: string,
};

export default class SearchPage extends React.Component<Props, State> {
  queryField: ?HTMLInputElement;

  static async getInitialProps(
    ctx: ClientContext,
    dependenciesForTest?: ClientDependencies
  ): Promise<Props> {
    const { query } = ctx;
    const { deathCertificatesDao } =
      dependenciesForTest || getDependencies(ctx);

    let q = query.q || '';
    let page = 1;

    let results = null;

    if (q) {
      page = parseInt(query.page, 10) || 1;

      results = await deathCertificatesDao.search(q, page);
    }

    return {
      query: q,
      page,
      results,
    };
  }

  constructor(props: Props) {
    super(props);

    const { query } = props;

    this.state = {
      query,
    };
  }

  submitSearch = (query: string) => {
    Router.push(`/death?q=${encodeURIComponent(query.trim())}`);
  };

  setQueryField = (queryField: ?HTMLInputElement) => {
    this.queryField = queryField;
  };

  handleQueryChange = (ev: SyntheticInputEvent<*>) => {
    const query: string = ev.target.value;
    this.setState({ query });
  };

  handleSubmit = (ev: SyntheticInputEvent<*>) => {
    ev.preventDefault();

    if (this.queryField) {
      this.queryField.blur();
    }

    const { query } = this.state;

    this.submitSearch(query);
  };

  render() {
    const { results, query: originalQuery } = this.props;
    const { query } = this.state;

    return (
      <AppLayout showNav>
        <div>
          <div className="b-c b-c--nbp">
            <Head>
              {originalQuery ? (
                <title>
                  Boston.gov — Death Certificates — Results for “{originalQuery}”
                </title>
              ) : (
                <title>Boston.gov — Death Certificates</title>
              )}
            </Head>

            <div className="sh sh--b0" style={{ paddingBottom: 0 }}>
              <h1 className="sh-title" style={{ marginBottom: 0 }}>
                {!results ? 'Death certificates' : 'Search results'}
              </h1>
            </div>

            {!results && this.renderIntro()}

            <div className="m-v300">
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
                    aria-label="Search box"
                    aria-describedby="searchExamples"
                    type="text"
                    name="q"
                    ref={this.setQueryField}
                    value={query}
                    onChange={this.handleQueryChange}
                    placeholder="Search by full or partial name…"
                    className="sf-i-f"
                    autoComplete="off"
                  />
                  <button className="sf-i-b" type="submit">
                    Search
                  </button>
                </div>

                <div className="t--subinfo m-t200" id="searchExamples">
                  Examples: “j doe” “robert frost 1963” “johnson 1956-1957”
                </div>
              </form>
            </div>
          </div>

          {results && results.resultCount > 0 && this.renderResults(results)}
          {results && results.resultCount === 0 && this.renderNoResults()}
        </div>
      </AppLayout>
    );
  }

  renderIntro() {
    return (
      <div>
        <p className="t--intro">
          We have death certificates for anyone who died in Boston, or who
          listed Boston as their home.
        </p>

        <p className="t--info" style={{ fontStyle: 'normal' }}>
          To order a death certificate for someone, start by searching for their
          name:
        </p>
      </div>
    );
  }

  renderResults(results: DeathCertificateSearchResults) {
    // we want the query that was searched for
    const { query, page } = this.props;

    const start = 1 + (results.page - 1) * results.pageSize;
    const end = Math.min(start + results.pageSize - 1, results.resultCount);

    return (
      <div className="m-t700">
        <div className="b-c b-c--ntp b-c--nbp">
          <div className="t--sans tt-u p-v200" style={{ fontSize: 12 }}>
            Showing {start}–{end} of {results.resultCount.toLocaleString()}{' '}
            results for “{query}”
          </div>

          {results.results.map(certificate => (
            <SearchResult
              certificate={certificate}
              key={certificate.id}
              backUrl={`/death?q=${query}&page=${page}`}
            />
          ))}

          {results.resultCount > results.results.length &&
            this.renderPagination(results)}
        </div>

        <div className="b--g m-t700">
          <div className="b-c b-c--smv">
            <div className="t--info m-b300">
              Not finding who you’re looking for?
            </div>
            {this.renderHelp()}
          </div>
        </div>
      </div>
    );
  }

  renderNoResults() {
    return (
      <div className="b-c b-c--ntp">
        <div className="t--intro m-t700 m-b300">
          No results found for this search.
        </div>
        <div>{this.renderHelp()}</div>
      </div>
    );
  }

  renderHelp() {
    return (
      <ul className="ul t--subinfo" style={{ fontStyle: 'normal' }}>
        <li>
          We only have death records for people who either died in the City of
          Boston or who had Boston as their residence on their death
          certificate.
        </li>

        <li>
          This site has all deaths from 1956 on, but only a few records before
          then. You can{' '}
          <a href="https://www.boston.gov/departments/registry/how-get-death-certificate">
            request a death certificate from before 1956
          </a>.
        </li>

        <li>
          Search for both formal names and nicknames. For example, if there are
          no results for “Elizabeth,” try “Betty.”
        </li>

        <li>
          You can also search for a partial name. For example, “Jo” matches
          “Joe” and “Joseph.”
        </li>

        <li>
          If the decedent had a hyphenated first or last name, try searching for
          only one of the parts.
        </li>

        <li>
          Add a 4-digit year of death. You can also search for a range of death
          years, like “smith 1960–1965”
        </li>

        <style jsx>
          {`
            & > li {
              margin-top: 0.5em;
            }
          `}
        </style>
      </ul>
    );
  }

  renderPagination({ page, pageCount }: DeathCertificateSearchResults) {
    const { query } = this.props;
    const makeHref = (p: number) => `/death?q=${query}&page=${p}`;

    return (
      <div className="m-v300">
        <Pagination page={page} pageCount={pageCount} hrefFunc={makeHref} />
      </div>
    );
  }
}
