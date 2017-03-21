// @flow
/* eslint react/no-unused-prop-types: 0 */

import React from 'react';
import { css } from 'glamor';
import Router from 'next/router';
import type { Context } from 'next';
import { action } from 'mobx';

import type { RequestAdditions } from '../../server/next-handlers';

import Nav from '../common/Nav';
import { LocationMapWithLib } from './map/LocationMap';
import HomeDialog from './home/HomeDialog';
import RequestDialog from './request/RequestDialog';

import { LARGE_SCREEN } from '../style-constants';

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
};

type RequestData = {
  view: 'request',
  code: string,
  service: ?Service,
  stage: 'questions' | 'location' | 'contact',
};

export type InitialProps = {
  data: HomeData | RequestData,
};

export type Props = {
  store: AppStore,
} & InitialProps;

const CONTAINER_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 'calc(100vh - 65px)',
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
  [LARGE_SCREEN]: {
    padding: '0 40px',
  },
});


// We have one class for picking the service type and doing the entire request
// so that we can keep a consistent Google Maps background behind the
// dialog and not repeatedly re-mount it.
//
// This class has two "views": the "summaries" view that lets the user pick a
// service request, and the "service" view for the request flow. That flow
// proceeds through the "questions" "location" and "contact" stages.
export default class ReportLayout extends React.Component {
  props: Props;
  state: {
    locationMapSearch: ?(query: string) => Promise<boolean>,
    locationMapActive: boolean,
  }
  loopbackGraphql: LoopbackGraphql;

  static async getInitialProps({ query, req, res }: Context<RequestAdditions>): Promise<InitialProps> {
    const loopbackGraphql = makeLoopbackGraphql(req);

    let data;

    if (query.code) {
      data = await ReportLayout.getRequestData(query, res, getStore(), loopbackGraphql);
    } else {
      data = await ReportLayout.getHomeData(loopbackGraphql);
    }

    return {
      data,
    };
  }

  static async getHomeData(loopbackGraphql): Promise<HomeData> {
    return {
      view: 'home',
      serviceSummaries: await loadServiceSummaries(loopbackGraphql),
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

    switch (stage) {
      case undefined:
      case 'questions':
      case 'location':
      case 'contact':
        return {
          view: 'request',
          code,
          service,
          stage: stage || 'questions',
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
      locationMapSearch: null,
      locationMapActive: false,
    };
  }

  componentWillReceiveProps(props: Props) {
    this.updateStoreWithProps(props);
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

  setLocationMapSearch = (locationMapSearch: ?(query: string) => Promise<boolean>) => {
    this.setState({ locationMapSearch });
  }

  setLocationMapActive = (active: boolean) => {
    const { locationMapActive } = this.state;

    if (locationMapActive !== active) {
      this.setState({ locationMapActive: active });
    }
  }

  render() {
    const { data, store } = this.props;
    const { locationMapActive, locationMapSearch } = this.state;
    const { isPhone } = store;

    return (
      <div className={CONTAINER_STYLE}>
        <Nav activeSection="report" />

        <div className={CONTENT_STYLE}>
          { (!isPhone || (data.view === 'request' && data.stage === 'location')) &&
            <LocationMapWithLib
              store={store}
              setLocationMapSearch={this.setLocationMapSearch}
              active={locationMapActive}
            />
          }
          <div className={DIALONG_WRAPPER_STYLE}>
            { data.view === 'home' &&
              <HomeDialog
                store={store}
                routeToServiceForm={this.routeToServiceForm}
              /> }
            { data.view === 'request' &&
              <RequestDialog
                store={store}
                stage={data.stage}
                locationMapSearch={locationMapSearch}
                loopbackGraphql={this.loopbackGraphql}
                routeToServiceForm={this.routeToServiceForm}
                setLocationMapActive={this.setLocationMapActive}
              />}
          </div>
        </div>
      </div>
    );
  }
}
