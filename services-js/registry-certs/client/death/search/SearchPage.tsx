/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent, Component, ComponentClass } from 'react';
import Head from 'next/head';
import Router from 'next/router';

import { getParam } from '@cityofboston/next-client-common';

import { DeathCertificateSearchResults } from '../../types';
import { PageDependencies, GetInitialProps } from '../../../pages/_app';

import PageLayout from '../../PageLayout';

import { BREADCRUMB_NAV_LINKS } from '../../../lib/breadcrumbs';

import Pagination from '../../common/Pagination';

import SearchResult from './SearchResult';

interface InitialProps {
  query: string;
  page: number;
  results: DeathCertificateSearchResults | null;
}

interface Props
  extends InitialProps,
    Pick<PageDependencies, 'siteAnalytics' | 'deathCertificateCart'> {}

interface State {
  query: string;
}

const HELP_LIST_STYLE = css({
  fontStyle: 'normal',

  '&>li': {
    marginTop: '0.5em',
  },
});

class SearchPage extends Component<Props, State> {
  queryField: HTMLInputElement | null = null;

  static getInitialProps: GetInitialProps<
    InitialProps,
    'query',
    'deathCertificatesDao'
  > = async ({ query }, { deathCertificatesDao }) => {
    let q = getParam(query.q, '');
    let page = 1;

    let results: DeathCertificateSearchResults | null = null;

    if (q) {
      page = parseInt(getParam(query.page, '1'), 10);

      results = await deathCertificatesDao.search(q, page);
    }

    return {
      query: q,
      page,
      results,
    };
  };

  constructor(props: Props) {
    super(props);

    const { query } = props;

    this.state = {
      query,
    };
  }

  componentWillMount() {
    const { results, siteAnalytics } = this.props;

    if (results) {
      results.results.forEach(({ id }, idx) => {
        siteAnalytics.addImpression(
          id,
          'Death certificate',
          'Search results',
          idx + 1
        );
      });
    }
  }

  submitSearch = (query: string) => {
    Router.push(`/death?q=${encodeURIComponent(query.trim())}`);
  };

  setQueryField = (queryField: HTMLInputElement | null) => {
    this.queryField = queryField;
  };

  handleQueryChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const query: string = ev.target.value;
    this.setState({ query });
  };

  handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();

    if (this.queryField) {
      this.queryField.blur();
    }

    const { query } = this.state;

    this.submitSearch(query);
  };

  render() {
    const { results, query: originalQuery, deathCertificateCart } = this.props;
    const { query } = this.state;

    return (
      <PageLayout
        showNav
        cart={deathCertificateCart}
        breadcrumbNav={BREADCRUMB_NAV_LINKS.death}
      >
        <div>
          <div className="b-c b-c--nbp">
            <Head>
              {originalQuery ? (
                <title>
                  Boston.gov — Death Certificates — Results for “{originalQuery}
                  ”
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

            <div className="m-v500">
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

            {!results && this.renderSubintro()}
          </div>

          {results && results.resultCount > 0 && this.renderResults(results)}
          {results && results.resultCount === 0 && this.renderNoResults()}
        </div>
      </PageLayout>
    );
  }

  renderIntro() {
    return (
      <div>
        <p className="t--intro">
          To order a death certificate for someone, start by searching for their
          name:
        </p>
      </div>
    );
  }

  renderSubintro() {
    return (
      <div>
        <p className="t--subinfo">
          We have death certificates from 1956 to the present for anyone who
          died in Boston or listed Boston as their home. If you need a death
          certificate from before 1956, you will need to order{' '}
          <a href="https://www.boston.gov/departments/registry/how-get-death-certificate#by-mail">
            by mail
          </a>{' '}
          or{' '}
          <a href="https://www.boston.gov/departments/registry/how-get-death-certificate#in-person">
            in person
          </a>
          .
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
      <ul className="ul t--subinfo" css={HELP_LIST_STYLE}>
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
          </a>
          .
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

export default (SearchPage as any) as ComponentClass<Props> & {
  getInitialProps: (typeof SearchPage)['getInitialProps'];
};
