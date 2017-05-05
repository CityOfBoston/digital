// @flow
/* global liveagent */

import React from 'react';
import { css } from 'glamor';
import Router from 'next/router';
import type { Context } from 'next';
import { observer } from 'mobx-react';

import type { RequestAdditions } from '../../server/next-handlers';

import Nav from '../common/Nav';
import LocationMap from '../map/LocationMap';
import type { MapMode } from '../map/LocationMap';
import HomeDialog from './home/HomeDialog';
import type { InitialProps as HomeDialogInitialProps } from './home/HomeDialog';
import RequestDialog from './request/RequestDialog';
import type { InitialProps as RequestDialogInitialProps } from './request/RequestDialog';

import { MEDIA_LARGE, HEADER_HEIGHT } from '../style-constants';

import makeLoopbackGraphql from '../../data/dao/loopback-graphql';
import type { LoopbackGraphql } from '../../data/dao/loopback-graphql';

import type { AppStore } from '../../data/store';

type HomeData = {|
  view: 'home',
  props: HomeDialogInitialProps,
|};

type RequestData = {|
  view: 'request',
  props: RequestDialogInitialProps,
|};

export type InitialProps = {|
  data: HomeData | RequestData,
|};

export type Props = {|
  store: AppStore,
  /* :: ...InitialProps, */
|};

type State = {|
  locationMapActive: boolean,
|};

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

// We have one class for picking the service type and doing the entire request
// so that we can keep a consistent Map background behind the
// dialog and not repeatedly re-mount it.
//
// This class has two "views": the "summaries" view that lets the user pick a
// service request, and the "service" view for the request flow. That flow
// proceeds through the "questions" "location" and "contact" stages.
@observer
export default class ReportLayout extends React.Component {
  props: Props;
  state: State = {
    locationMapActive: false,
  };
  loopbackGraphql: LoopbackGraphql = makeLoopbackGraphql();

  static async getInitialProps(ctx: Context<RequestAdditions>): Promise<InitialProps> {
    const { query } = ctx;

    let data;

    if (query.code) {
      data = {
        view: 'request',
        props: await RequestDialog.getInitialProps(ctx),
      };
    } else {
      data = {
        view: 'home',
        props: await HomeDialog.getInitialProps(ctx),
      };
    }

    return {
      data,
    };
  }

  componentDidMount() {
    const { store } = this.props;
    store.mapLocation.start(this.loopbackGraphql);
  }

  componentWillReceiveProps() {
    this.setState({ locationMapActive: false });
  }

  componentWillUnmount() {
    const { store } = this.props;
    store.mapLocation.stop();
  }

  routeToServiceForm = async (code: string, stage: string = 'questions') => {
    if (stage === 'questions') {
      await Router.push(`/report?code=${code}`, `/report/${code}`);
    } else {
      await Router.push(`/report?code=${code}&stage=${stage}`, `/report/${code}/${stage}`);
    }

    window.scrollTo(0, 0);
  }

  setLocationMapActive = (active: boolean) => {
    const { locationMapActive } = this.state;

    if (locationMapActive !== active) {
      this.setState({ locationMapActive: active });
    }
  }

  render() {
    const { data, store } = this.props;
    const { locationMapActive } = this.state;
    const { ui: { mediaLarge } } = store;

    let mapMode: MapMode;
    if (locationMapActive) {
      mapMode = 'picker';
    } else {
      mapMode = 'inactive';
    }

    return (
      <div>
        <Nav activeSection="report" />

        {/* Outer box needs to take up at least the screen size on desktop, so
            that the content can center over the map and keep the footer from
            encroaching up. */}
        <div className={`mn mn--full mn--nv-s ${CONTAINER_STYLE.toString()}`} style={{ backgroundColor: 'transparent' }} role="main">
          { mediaLarge &&
            <div className={BACKGROUND_MAP_CONTAINER_STYLE}>
              <LocationMap
                store={store}
                mode={mapMode}
                mobile={false}
              />
            </div>
          }

          { /* We can't put any wrappers around the dialogs below because in the
               case of RequestDialog's location picker, it needs to make sure nothing
               is overlapping the map so it can get clicks. */}

          { data.view === 'home' &&
            <HomeDialog
              store={store}
              loopbackGraphql={this.loopbackGraphql}
              {...data.props}
            /> }

          { data.view === 'request' &&
            <RequestDialog
              store={store}
              loopbackGraphql={this.loopbackGraphql}
              routeToServiceForm={this.routeToServiceForm}
              setLocationMapActive={this.setLocationMapActive}
              {...data.props}
            />}
        </div>

      </div>
    );
  }
}
