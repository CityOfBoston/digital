// @flow

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';
import { css } from 'glamor';
import type { Context } from 'next';

import searchDeathCertificates from '../queries/search-death-certificates';
import makeLoopbackGraphql from '../loopback-graphql';
import type { DeathCertificate } from '../types';

import type Cart from '../store/Cart';
import Nav from '../common/Nav';

import { GRAY_100 } from '../common/style-constants';

const RESULT_STYLE = css({
  display: 'block',
  color: 'inherit',
  fontStyle: 'italic',
  borderColor: GRAY_100,
});

export type InitialProps = {|
  query: string,
  results: ?DeathCertificate[],
|}

export type Props = {
  /* :: ...InitialProps, */
  cart: Cart,
}

type State = {
  query: string,
};

export default class IndexPage extends React.Component {
  props: Props;
  state: State;

  static async getInitialProps(ctx: Context<*>): Promise<InitialProps> {
    const { query, req } = ctx;

    let results = null;

    if (query.q) {
      const loopbackGraphql = makeLoopbackGraphql(req);
      results = await searchDeathCertificates(loopbackGraphql, query.q);
    }

    return {
      query: query.q || '',
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

  handleQueryChange = (ev: SyntheticInputEvent) => {
    this.setState({ query: ev.target.value });
  };

  handleSubmit = (ev: SyntheticInputEvent) => {
    const { query } = this.state;

    ev.preventDefault();
    Router.push(`/death?q=${encodeURIComponent(query)}`);
  }

  render() {
    const { results, cart } = this.props;
    const { query } = this.state;

    return (
      <div>
        <Head>
          <title>Boston.gov — Death Certificates</title>
        </Head>

        <Nav cart={cart} link="checkout" />

        <div className="p-a300 b--g">
          <div className="sh sh--b0">
            <h1 className="sh-title">Death Certificates</h1>
          </div>

          <form className="sf sf--md" acceptCharset="UTF-8" method="get" action="/death" onSubmit={this.handleSubmit}>
            <input name="utf8" type="hidden" value="✓" />

            <div className="sf-i">
              <input type="text" name="q" id="q" value={query} onChange={this.handleQueryChange} placeholder="Search…" className="sf-i-f" autoComplete="off" />
              <button className="sf-i-b" type="submit">Search</button>
            </div>
          </form>
        </div>

        { results && this.renderResults(results) }
        <div />
      </div>
    );
  }

  renderResults(results: DeathCertificate[]) {
    // we want the query that was searched for
    const { query } = this.props;

    return (
      <div>
        <div className="p-a300">
          <div className="t--sans tt-u" style={{ fontSize: 12 }}>
            Showing { results.length } results for “{query}”
          </div>
        </div>

        { results.map(this.renderResult) }

        <div className="p-a300 b--g">
          Not finding what you’re looking for? Try refining your search or <a href="https://www.boston.gov/departments/registry/how-get-death-certificate" style={{ fontStyle: 'italic' }}>request a death certificate</a>.
        </div>
      </div>
    );
  }

  renderResult({ firstName, lastName, birthYear, deathYear, id, causeOfDeath }: DeathCertificate) {
    return (
      <Link key={id} href={`/death/certificate?id=${id}`} as={`/death/certificate/${id}`}>
        <a className={`p-a300 br br-t100 ${RESULT_STYLE.toString()}`}>
          <div style={{ fontWeight: 'bold' }}>{firstName} {lastName}</div>
          <div>Born: {birthYear} – Died: {deathYear}</div>
          <div>Cause of death: {causeOfDeath ? 'Known' : 'Unknown'}</div>
        </a>
      </Link>
    );
  }

}
