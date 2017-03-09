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

import LoadServiceGraphql from '../../data/graphql/LoadService.graphql';
import LoadServiceSummariesGraphql from '../../data/graphql/LoadServiceSummaries.graphql';
import makeLoopbackGraphql from '../../data/graphql/loopback-graphql';
import type { LoopbackGraphql } from '../../data/graphql/loopback-graphql';

import type { LoadServiceSummariesQuery, LoadServiceQuery } from '../../data/graphql/schema.flow';
import type { ServiceArgs, Service, ServiceSummary } from '../../data/types';

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
  apiKeys: ?{[service: string]: string},
};

const CONTAINER_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  marginTop: -55,
});

const CONTENT_STYLE = css({
  flex: 1,
  position: 'relative',
});


// We have one class for picking the service type and doing the entire request
// so that we can keep a consistent Google Maps background behind the
// dialog and not repeatedly re-mount it.
//
// This class has two "views": the "summaries" view that lets the user pick a
// service request, and the "service" view for the request flow. That flow
// proceeds through the "questions" "location" and "contact" stages.
export default class ReportLayout extends React.Component {
  props: InitialProps;
  state: {
    locationMapSearch: ?(query: string) => Promise<boolean>,
    locationMapActive: boolean,
  }
  loopbackGraphql: LoopbackGraphql;
  store: AppStore;

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
      apiKeys: req ? req.apiKeys : null,
    };
  }

  static async getHomeData(loopbackGraphql): Promise<HomeData> {
    const response: LoadServiceSummariesQuery = await loopbackGraphql(LoadServiceSummariesGraphql);
    return {
      view: 'home',
      serviceSummaries: response.services,
    };
  }

  static async getRequestData({ code, stage }, res, store, loopbackGraphql): Promise<RequestData> {
    let service = store.serviceCache[code];

    if (!service) {
      const args: ServiceArgs = { code };
      const response: LoadServiceQuery = await loopbackGraphql(LoadServiceGraphql, args);

      service = response.service;

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
    store.serviceCache[service.code] = service;
  }

  constructor(props: InitialProps) {
    super(props);

    this.store = getStore();
    this.loopbackGraphql = makeLoopbackGraphql();

    this.updateStoreWithProps(props);

    this.state = {
      locationMapSearch: null,
      locationMapActive: false,
    };
  }

  componentWillReceiveProps(props: InitialProps) {
    this.updateStoreWithProps(props);
  }

  @action
  updateStoreWithProps(props: InitialProps) {
    if (props.apiKeys) {
      this.store.apiKeys = props.apiKeys;
    }

    switch (props.data.view) {
      case 'home':
        this.store.serviceSummaries = props.data.serviceSummaries;
        this.store.currentService = null;
        break;

      case 'request': {
        const { service } = props.data;
        if (service) {
          ReportLayout.addServiceToCache(this.store, service);
        }
        this.store.currentService = service;
        break;
      }

      default:
        break;
    }
  }

  routeToServiceForm = (code: string, stage: string = 'questions') => {
    if (stage === 'questions') {
      Router.push(`/report?code=${code}`, `/report/${code}`);
    } else {
      Router.push(`/report?code=${code}&stage=${stage}`, `/report/${code}/${stage}`);
    }
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
    const { data } = this.props;
    const { locationMapActive, locationMapSearch } = this.state;

    return (
      <div className={CONTAINER_STYLE}>
        <Nav />

        <div className={CONTENT_STYLE}>
          <LocationMapWithLib
            store={this.store}
            setLocationMapSearch={this.setLocationMapSearch}
            active={locationMapActive}
          />
          { data.view === 'home' &&
            <HomeDialog
              store={this.store}
              routeToServiceForm={this.routeToServiceForm}
            /> }
          { data.view === 'request' &&
            <RequestDialog
              store={this.store}
              stage={data.stage}
              locationMapSearch={locationMapSearch}
              loopbackGraphql={this.loopbackGraphql}
              routeToServiceForm={this.routeToServiceForm}
              setLocationMapActive={this.setLocationMapActive}
            />}
        </div>
      </div>
    );
  }
}
