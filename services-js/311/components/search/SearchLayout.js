// @flow

import React from 'react';
import type { Context } from 'next';
import Router from 'next/router';
import { css } from 'glamor';
import { action, reaction } from 'mobx';
import { observer } from 'mobx-react';
import Head from 'next/head';

import type { RequestAdditions } from '../../server/next-handlers';
import type { AppStore } from '../../data/store';

import makeLoopbackGraphql from '../../data/dao/loopback-graphql';
import type { LoopbackGraphql } from '../../data/dao/loopback-graphql';

import Nav from '../common/Nav';
import LocationMap from '../map/LocationMap';
import { MEDIA_LARGE, HEADER_HEIGHT } from '../style-constants';

import RecentRequests from './RecentRequests';

type SearchData = {|
  view: 'search',
  query: string,
|}

export type InitialProps = {|
  data: SearchData,
|};

export type Props = {|
  /* :: ...InitialProps, */
  store: AppStore,
|}

// This is the main container for content. We want to be at least full height on
// large screens to push the footer down to where you need to scroll for it.
const CONTAINER_STYLE = css({
  minHeight: 0,
  position: 'relative',
  justifyContent: 'flex-start',
  [MEDIA_LARGE]: {
    minHeight: '100vh',
  },
});

const BACKGROUND_MAP_CONTAINER_STYLE = css({
  position: 'fixed',
  width: '100%',
  top: HEADER_HEIGHT,
  bottom: 0,
  background: '#9B9B9B',
});

@observer
export default class LookupLayout extends React.Component {
  props: Props;
  loopbackGraphql: LoopbackGraphql = makeLoopbackGraphql();

  locationUpdateDisposer: ?Function;

  static async getInitialProps({ query }: Context<RequestAdditions>): Promise<InitialProps> {
    return {
      data: {
        view: 'search',
        query: query.q || '',
      },
    };
  }

  @action
  componentDidMount() {
    const { store, data } = this.props;
    store.requestSearch.start(this.loopbackGraphql);
    store.requestSearch.query = data.query;

    this.locationUpdateDisposer = reaction(
      () => store.requestSearch.resultsQuery,
      (resultsQuery: string) => {
        if (resultsQuery === '') {
          Router.push('/search');
        } else {
          Router.push(`/search?q=${encodeURIComponent(resultsQuery)}`);
        }
      },
      {
        name: 'location query updater',
      },
    );
  }

  componentWillUnmount() {
    const { store } = this.props;
    store.requestSearch.stop();

    if (this.locationUpdateDisposer) {
      this.locationUpdateDisposer();
      this.locationUpdateDisposer = null;
    }
  }

  render() {
    const { store } = this.props;

    return (
      <div className={`mn mn--full mn--nv-s ${CONTAINER_STYLE.toString()}`} style={{ backgroundColor: 'transparent' }}>
        <Head>
          <title>BOS:311 — Public Cases</title>
        </Head>

        <Nav activeSection="search" />

        <div className={BACKGROUND_MAP_CONTAINER_STYLE}>
          <LocationMap
            store={store}
            mode={'requests'}
          />
        </div>

        <RecentRequests store={store} />
      </div>

    );
  }

}