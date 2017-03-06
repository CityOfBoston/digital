// @flow
/* eslint react/no-unused-prop-types: 0 */

import React from 'react';
import { css } from 'glamor';
import Router from 'next/router';
import type { Context } from 'next';

import type { RequestAdditions } from '../../server/next-handlers';

import Nav from '../common/Nav';
import LocationMapContainer from './map';
import HomeDialogContainer from './home';
import RequestDialogContainer from './request';

import LoadServiceGraphql from '../../data/graphql/LoadService.graphql';
import LoadServiceSummariesGraphql from '../../data/graphql/LoadServiceSummaries.graphql';
import makeLoopbackGraphql from '../../data/graphql/loopback-graphql';
import type { LoopbackGraphql } from '../../data/graphql/loopback-graphql';

import type { LoadServiceSummariesQuery, LoadServiceQuery } from '../../data/graphql/schema.flow';
import type { Store } from '../../data/store';
import type { ServiceArgs, Service, ServiceSummary } from '../../data/types';

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

async function getHomeData(loopbackGraphql): Promise<HomeData> {
  const response: LoadServiceSummariesQuery = await loopbackGraphql(LoadServiceSummariesGraphql);
  return {
    view: 'home',
    serviceSummaries: response.services,
  };
}

async function getRequestData({ code, stage }, res, store, loopbackGraphql): Promise<RequestData> {
  const args: ServiceArgs = { code };
  const response: LoadServiceQuery = await loopbackGraphql(LoadServiceGraphql, args);

  const service = response.service;

  if (res && !service) {
    // eslint-disable-next-line no-param-reassign
    res.statusCode = 404;
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

  static async getInitialProps({ query, req, res }: Context<RequestAdditions>, store: Store): Promise<InitialProps> {
    const loopbackGraphql = makeLoopbackGraphql(req);

    if (query.code) {
      return { data: await getRequestData(query, res, store, loopbackGraphql) };
    } else {
      return { data: await getHomeData(loopbackGraphql) };
    }
  }

  constructor(props: InitialProps) {
    super(props);

    this.loopbackGraphql = makeLoopbackGraphql();

    this.state = {
      locationMapSearch: null,
      locationMapActive: false,
    };
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
          <LocationMapContainer
            setSearchFunc={this.setLocationMapSearch}
            setLocationMapSearch={this.setLocationMapSearch}
            active={locationMapActive}
          />
          { data.view === 'home' &&
            <HomeDialogContainer
              serviceSummaries={data.serviceSummaries}
              routeToServiceForm={this.routeToServiceForm}
            /> }
          { data.view === 'request' &&
            <RequestDialogContainer
              service={data.service}
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
