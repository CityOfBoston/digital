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
import { MAX_WIDTH as DIALOG_MAX_WIDTH } from '../common/FormDialog';
import LocationMap from './map/LocationMap';
import type { MapMode } from './map/LocationMap';
import HomeDialog from './home/HomeDialog';
import RecentRequests from './home/RecentRequests';
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
  [MEDIA_LARGE]: {
    padding: '0 40px',
  },
});

const TAB_WRAPPER_STYLE = css(DIALONG_WRAPPER_STYLE, {
  position: 'absolute',
  bottom: 0,
  width: '100%',
});

const TAB_HOLDER_STYLE = css({
  maxWidth: DIALOG_MAX_WIDTH,
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const TAB_STYLE = css({
  background: 'white',
});

const LIVE_CHAT_TAB_STYLE = css(TAB_STYLE, {
  position: 'fixed',
  // This isn't quite right. Revisit if we keep this as a tab.
  right: 40,
});

const RECENT_CASES_STYLE = css({
  minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
  width: '40%',
  position: 'relative',
  zIndex: 1,
  backgroundColor: 'white',
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
      return Math.min(1.0, ui.scrollY / (ui.visibleHeight * 0.25));
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
    const { ui: { mediaLarge }, liveAgentAvailable } = store;

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

        <div className={`mn mn--full mn--nv-s ${CONTAINER_STYLE.toString()}`} style={{ backgroundColor: 'transparent' }}>
          <div className={CONTENT_STYLE}>
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

          { mediaLarge && data.view === 'home' && data.stage === 'home' &&
            <div className={TAB_WRAPPER_STYLE}><div className={TAB_HOLDER_STYLE}>
              <a
                href="#recent"
                className={`p-a300 t--sans tt-u br ${TAB_STYLE.toString()}`}
                style={{ left: 80 }}
              >Recent Cases</a>

              { liveAgentAvailable &&
                <a
                  className={`p-a300 t--sans tt-u br ${LIVE_CHAT_TAB_STYLE.toString()}`}
                  href="javascript:void(0)"
                  onClick={this.startChat}
                >Live Chat Online</a> }
            </div></div>
          }

        </div>

        {
          mediaLarge && data.view === 'home' && data.stage === 'home' &&
          <div className={RECENT_CASES_STYLE}>
            <a name="recent" />
            <RecentRequests store={store} />
          </div>
        }
      </div>
    );
  }
}
