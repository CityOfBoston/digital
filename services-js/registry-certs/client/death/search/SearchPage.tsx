/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent, Component, ComponentClass } from 'react';
import Head from 'next/head';
import Router from 'next/router';

import { getParam } from '@cityofboston/next-client-common';
import {
  ProgressBar,
  CHARLES_BLUE,
  OPTIMISTIC_BLUE_DARK,
  SANS,
  SERIF,
  WHITE,
} from '@cityofboston/react-fleet';

import { DeathCertificateSearchResults } from '../../types';
import { PageDependencies, GetInitialProps } from '../../../pages/_app';

import PageLayout from '../../PageLayout';

import { BREADCRUMB_NAV_LINKS } from '../../../lib/breadcrumbs';
import { DEATH_SSN_DOCUMENTATION_URL } from '../../../lib/deathSsnNotice';

import Pagination from '../../common/Pagination';

import SearchResult from './SearchResult';
import { DEATH_APP_TITLE_STYLING } from '../deathFlowTitles';

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

/**
 * STEP 1 — Search for a death certificate.
 * Layout and copy follow Figma “STEP 1- SEARCH” / “Search/Death certificate”.
 */
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

  handleClearQuery = () => {
    this.setState({ query: '' }, () => {
      if (this.queryField) {
        this.queryField.focus();
      }
    });
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
          <div className="b-c b-c--nbp" css={PAGE_STYLING}>
            <Head>
              {originalQuery ? (
                <title>
                  Boston.gov — Death Certificates — Results for “
                  {originalQuery}”
                </title>
              ) : (
                <title>Boston.gov — Death Certificates</title>
              )}
            </Head>

            <h1 css={DEATH_APP_TITLE_STYLING}>Request a death certificate</h1>

            {results && (
              <div css={PROGRESS_WRAP_STYLING}>
                <ProgressBar
                  totalSteps={7}
                  currentStep={1}
                  currentStepCompleted
                />
              </div>
            )}

            {!results && this.renderIntro()}

            <form
              css={SEARCH_FORM_STYLING}
              acceptCharset="UTF-8"
              method="get"
              action="/death"
              onSubmit={this.handleSubmit}
            >
              <input name="utf8" type="hidden" value="✓" />

              <label htmlFor="death-search-q" css={SEARCH_LABEL_STYLING}>
                Search by full name or partial name
              </label>

              <div css={SEARCH_FIELD_STYLING}>
                <input
                  id="death-search-q"
                  aria-label="Search by full name or partial name"
                  aria-describedby={!results ? 'searchExamples' : undefined}
                  type="text"
                  name="q"
                  ref={this.setQueryField}
                  value={query}
                  onChange={this.handleQueryChange}
                  placeholder="Search by full name or partial name"
                  css={SEARCH_INPUT_STYLING}
                  autoComplete="off"
                />

                {query.length > 0 && (
                  <button
                    type="button"
                    css={CLEAR_BUTTON_STYLING}
                    aria-label="Clear search"
                    onClick={this.handleClearQuery}
                  >
                    <img
                      src="/assets/images/death-search-clear.svg"
                      alt=""
                      width={24}
                      height={24}
                    />
                  </button>
                )}

                <button
                  type="submit"
                  css={SEARCH_BUTTON_STYLING}
                  aria-label="Search"
                >
                  <img
                    src="/assets/images/death-search-icon.svg"
                    alt=""
                    width={24}
                    height={24}
                  />
                </button>
              </div>

              {!results && (
                <div css={SEARCH_EXAMPLES_STYLING} id="searchExamples">
                  Examples: “j doe” “robert frost 1963” “johnson 1956-1957”
                </div>
              )}
            </form>

            {!results && this.renderLandingNotes()}

            {results &&
              results.resultCount > 0 &&
              this.renderResultsList(results)}
            {results && results.resultCount === 0 && this.renderNoResults()}
          </div>

          {results && results.resultCount > 0 && this.renderHelpSection()}
        </div>
      </PageLayout>
    );
  }

  renderIntro() {
    return (
      <p css={INTRO_STYLING}>
        To order a death certificate for someone, start by searching for their
        name:
      </p>
    );
  }

  renderLandingNotes() {
    return (
      <div css={LANDING_NOTES_STYLING}>
        <p>
          <strong>Note:</strong> We have death certificates from 1956 to the
          present for anyone who died in Boston or listed Boston as their home.
          If you need a death certificate from before 1956, you will need to
          order{' '}
          <a href="https://www.boston.gov/departments/registry/how-get-death-certificate#by-mail">
            by mail
          </a>{' '}
          or{' '}
          <a href="https://www.boston.gov/departments/registry/how-get-death-certificate#in-person">
            in person
          </a>
          .
        </p>
        <p>
          <strong>Need the Social Security number on the certificate?</strong>
          <br />
          Starting July 1, 2026, Social Security numbers will not appear on
          Massachusetts death certificates unless the requester has an eligible
          need. You will need to upload documents proving your identity and your
          relationship to the decedent.{' '}
          <a href={DEATH_SSN_DOCUMENTATION_URL}>
            Review the required documents
          </a>{' '}
          before you begin.
        </p>
      </div>
    );
  }

  renderResultsList(results: DeathCertificateSearchResults) {
    const { query, page } = this.props;

    const pageSize = results.pageSize || 20;
    const start = 1 + (results.page - 1) * pageSize;
    const end = start + results.results.length - 1;
    // Derive from resultCount so pagination never advertises empty pages.
    const pageCount =
      results.resultCount === 0
        ? 0
        : Math.ceil(results.resultCount / pageSize);

    return (
      <div css={RESULTS_STYLING}>
        <p css={RESULTS_INSTRUCTION_STYLING}>
          Select the correct person from the results below. If multiple people 
          have similar names, check the date of birth and date of death 
          carefully. Your selection can't be changed once your order to 
          submitted.
        </p>

        <div css={RESULTS_SUMMARY_STYLING}>
          Showing {start}–{end} of {results.resultCount.toLocaleString()}{' '}
          results for “{query}”
        </div>

        <div css={RESULTS_LIST_STYLING} role="list">
          {results.results.map(certificate => (
            <div role="listitem" key={certificate.id}>
              <SearchResult
                certificate={certificate}
                backUrl={`/death?q=${encodeURIComponent(query)}&page=${page}`}
              />
            </div>
          ))}
        </div>

        {pageCount > 1 &&
          this.renderPagination({ ...results, pageSize, pageCount })}
      </div>
    );
  }

  renderHelpSection() {
    return (
      <div className="b--g m-t700">
        <div className="b-c b-c--smv">
          <div className="t--info m-b300">
            Not finding who you’re looking for?
          </div>
          {this.renderHelp()}
        </div>
      </div>
    );
  }

  renderNoResults() {
    return (
      <div className="m-t700">
        <div className="t--intro m-b300">No results found for this search.</div>
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
          “Joe” and “Joseph.”
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
    const makeHref = (p: number) =>
      `/death?q=${encodeURIComponent(query)}&page=${p}`;

    return (
      <div css={PAGINATION_WRAP_STYLING}>
        <Pagination page={page} pageCount={pageCount} hrefFunc={makeHref} />
      </div>
    );
  }
}

export default (SearchPage as any) as ComponentClass<Props> & {
  getInitialProps: (typeof SearchPage)['getInitialProps'];
};

const PAGE_STYLING = css({
  maxWidth: '45rem',
});

const PROGRESS_WRAP_STYLING = css({
  marginBottom: '2rem',
});

const INTRO_STYLING = css({
  margin: '0 0 1.5rem',
  fontFamily: SERIF,
  fontSize: '1.125rem',
  lineHeight: 1.4,
  color: CHARLES_BLUE,
});

const SEARCH_FORM_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  marginBottom: '1.5rem',
});

const SEARCH_LABEL_STYLING = css({
  margin: 0,
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1rem',
  lineHeight: 1.3,
  textTransform: 'uppercase',
  color: CHARLES_BLUE,
});

const SEARCH_FIELD_STYLING = css({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  boxSizing: 'border-box',
  width: '100%',
  minHeight: '44px',
  padding: '10px',
  backgroundColor: WHITE,
  border: `1px solid ${CHARLES_BLUE}`,
});

const ICON_BUTTON_STYLING = {
  appearance: 'none' as const,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: 24,
  height: 24,
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',

  img: {
    display: 'block',
    width: 24,
    height: 24,
  },
};

const CLEAR_BUTTON_STYLING = css({
  ...ICON_BUTTON_STYLING,

  '&:focus': {
    outline: 'none',
  },

  '&:focus-visible': {
    outline: `2px solid ${OPTIMISTIC_BLUE_DARK}`,
    outlineOffset: '2px',
  },
});

const SEARCH_BUTTON_STYLING = css({
  ...ICON_BUTTON_STYLING,

  '&:hover': {
    backgroundColor: '#f3f3f3',

    img: {
      filter: 'brightness(0.55)',
    },
  },

  '&:focus': {
    outline: 'none',
    backgroundColor: '#f3f3f3',

    img: {
      filter: 'brightness(0.55)',
    },
  },

  '&:focus-visible': {
    outline: `2px solid ${OPTIMISTIC_BLUE_DARK}`,
    outlineOffset: '2px',
  },
});

const SEARCH_INPUT_STYLING = css({
  flex: 1,
  minWidth: 0,
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'transparent',
  fontFamily: SERIF,
  fontSize: '1rem',
  lineHeight: 1.4,
  color: CHARLES_BLUE,

  '&::placeholder': {
    color: '#58585b',
  },

  '&:focus': {
    outline: 'none',
  },

  '&:focus-visible': {
    outline: `2px solid ${OPTIMISTIC_BLUE_DARK}`,
    outlineOffset: '2px',
  },
});

const SEARCH_EXAMPLES_STYLING = css({
  margin: 0,
  fontFamily: SERIF,
  fontStyle: 'italic',
  fontSize: '0.875rem',
  lineHeight: 1.4,
  color: CHARLES_BLUE,
});

const LANDING_NOTES_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginBottom: '2rem',
  fontFamily: SERIF,
  fontSize: '0.9375rem',
  lineHeight: 1.5,
  color: CHARLES_BLUE,

  p: {
    margin: 0,
  },

  a: {
    color: OPTIMISTIC_BLUE_DARK,
    textDecoration: 'underline',
  },
});

const RESULTS_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  marginBottom: '2rem',
});

const RESULTS_INSTRUCTION_STYLING = css({
  margin: 0,
  padding: '10px',
  boxSizing: 'border-box',
  backgroundColor: 'rgba(24, 113, 189, 0.2)',
  fontFamily: SERIF,
  fontWeight: 500,
  fontSize: '1.125rem',
  lineHeight: 1.4,
  color: CHARLES_BLUE,
});

const RESULTS_SUMMARY_STYLING = css({
  fontFamily: SERIF,
  fontSize: '1rem',
  lineHeight: 1.4,
  color: '#58585b',
});

const RESULTS_LIST_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

const PAGINATION_WRAP_STYLING = css({
  marginTop: '0.5rem',
});

const HELP_LIST_STYLE = css({
  fontStyle: 'normal',

  '&>li': {
    marginTop: '0.5em',
  },
});
