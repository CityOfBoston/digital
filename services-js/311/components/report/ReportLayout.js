// @flow
/* global liveagent */
/* eslint jsx-a11y/anchor-has-content: 0 */

import React from 'react';
import { css } from 'glamor';
import Router from 'next/router';
import type { Context } from 'next';
import { action, computed } from 'mobx';
import { observer } from 'mobx-react';

import type { RequestAdditions } from '../../server/next-handlers';

import Nav from '../common/Nav';
import LocationMap from './map/LocationMap';
import type { MapMode } from './map/LocationMap';
import HomeDialog from './home/HomeDialog';
import RecentRequests from './home/RecentRequests';
import RecentRequestsHeader from './home/RecentRequestsHeader';
import RequestDialog from './request/RequestDialog';

import { MEDIA_LARGE, HEADER_HEIGHT } from '../style-constants';

import makeLoopbackGraphql from '../../data/dao/loopback-graphql';
import type { LoopbackGraphql } from '../../data/dao/loopback-graphql';

import loadServiceSummaries from '../../data/dao/load-service-summaries';
import loadService from '../../data/dao/load-service';

import type { Service, ServiceSummary } from '../../data/types';

import getStore from '../../data/store';
import type { AppStore } from '../../data/store';

type HomeData = {
  view: 'home',
  serviceSummaries: ServiceSummary[],
  stage: 'home' | 'choose',
};

type RequestData = {
  view: 'request',
  code: string,
  service: ?Service,
  stage: 'questions' | 'location' | 'contact' | 'submit',
};

export type InitialProps = {
  data: HomeData | RequestData,
};

export type Props = {
  store: AppStore,
} & InitialProps;

const CONTAINER_STYLE = css({
  minHeight: 0,
  position: 'relative',
  // allows sticky children of the container to overlap things below this
  // container in the source
  zIndex: 2,
  [MEDIA_LARGE]: {
    minHeight: '100vh',
  },
});

const CONTENT_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  position: 'relative',
});

// Puts a little spacing around the dialog, which has auto left/right margins.
// Lets the map show through on large screens.
const DIALONG_WRAPPER_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'space-around',

  [MEDIA_LARGE]: {
    padding: '0 40px',
  },
});

const RECENT_REQUESTS_CONTAINER_STYLE = css({
  minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
  position: 'relative',
  width: '40%',
  maxWidth: '35rem',
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
  state: {
    locationMapActive: boolean,
  }
  loopbackGraphql: LoopbackGraphql;

  static async getInitialProps({ query, req, res }: Context<RequestAdditions>): Promise<InitialProps> {
    const loopbackGraphql = makeLoopbackGraphql(req);

    let data;

    if (query.code) {
      data = await ReportLayout.getRequestData(query, res, getStore(), loopbackGraphql);
    } else {
      data = await ReportLayout.getHomeData(query, loopbackGraphql);
    }

    return {
      data,
    };
  }

  static async getHomeData({ stage }, loopbackGraphql): Promise<HomeData> {
    const store = getStore();

    return {
      view: 'home',
      serviceSummaries: store.serviceSummaries || await loadServiceSummaries(loopbackGraphql),
      stage: stage === 'choose' ? stage : 'home',
    };
  }

  static async getRequestData({ code, stage }, res, store, loopbackGraphql): Promise<RequestData> {
    let service = store.serviceCache.get(code);

    if (!service) {
      service = await loadService(loopbackGraphql, code);

      if (!service && res) {
        res.statusCode = 404;
      }
    }

    stage = stage || 'questions';

    switch (stage) {
      case 'questions':
      case 'location':
      case 'contact':
      case 'submit':
        return {
          view: 'request',
          code,
          service,
          stage,
        };
      default:
        throw new Error(`Unknown stage: ${stage}`);
    }
  }

  // TODO(finneganh): Move service cache and lookup out of this class
  @action static addServiceToCache(store: AppStore, service: Service) {
    store.serviceCache.set(service.code, service);
  }

  constructor(props: Props) {
    super(props);

    this.loopbackGraphql = makeLoopbackGraphql();

    this.updateStoreWithProps(props);

    this.state = {
      locationMapActive: false,
    };
  }

  componentDidMount() {
    this.props.store.requestSearch.start(this.loopbackGraphql);
  }

  componentWillReceiveProps(props: Props) {
    this.updateStoreWithProps(props);
    this.setState({ locationMapActive: false });
  }

  componentWillUnmount() {
    this.props.store.requestSearch.stop();
  }

  startChat = () => {
    const { liveAgentButtonId } = this.props.store;
    liveagent.startChat(liveAgentButtonId);
  }

  @computed get mapActivationRatio(): number {
    const { store: { ui }, data: { view, stage } } = this.props;
    if (view === 'home' && stage === 'home') {
      return Math.min(1.0, ui.scrollY / (ui.visibleHeight * 0.75));
    } else {
      return 0;
    }
  }

  @action
  updateStoreWithProps(props: Props) {
    const { store, data } = props;

    switch (data.view) {
      case 'home':
        store.serviceSummaries = data.serviceSummaries;
        store.currentService = null;
        break;

      case 'request': {
        const { service } = data;
        if (service) {
          ReportLayout.addServiceToCache(store, service);
        }
        store.currentService = service;
        break;
      }

      default:
        break;
    }
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
    } else if (this.mapActivationRatio === 1.0) {
      mapMode = 'requests';
    } else {
      mapMode = 'inactive';
    }

    return (
      <div>
        <Nav activeSection="report" />

        { mediaLarge &&
          <div className={BACKGROUND_MAP_CONTAINER_STYLE}>
            <LocationMap
              store={store}
              loopbackGraphql={this.loopbackGraphql}
              mode={mapMode}
              opacityRatio={this.mapActivationRatio}
            />
          </div>
        }

        <div className={`mn mn--full mn--nv-s ${CONTAINER_STYLE.toString()}`} style={{ backgroundColor: 'transparent' }}>
          <div className={CONTENT_STYLE}>
            <div className={DIALONG_WRAPPER_STYLE}>
              { data.view === 'home' &&
                <HomeDialog
                  store={store}
                  loopbackGraphql={this.loopbackGraphql}
                  stage={data.stage}
                /> }
              { data.view === 'request' &&
                <RequestDialog
                  store={store}
                  stage={data.stage}
                  loopbackGraphql={this.loopbackGraphql}
                  routeToServiceForm={this.routeToServiceForm}
                  setLocationMapActive={this.setLocationMapActive}
                />}
            </div>
          </div>

          {
            mediaLarge && data.view === 'home' && data.stage === 'home' &&
            <RecentRequestsHeader store={store} />
          }
        </div>

        {
          mediaLarge && data.view === 'home' && data.stage === 'home' &&
          <div className={RECENT_REQUESTS_CONTAINER_STYLE}>
            <RecentRequests store={store} />
          </div>
        }
      </div>
    );
  }
}
