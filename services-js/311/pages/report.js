// @flow

import React from 'react';
import Head from 'next/head';
import Router from 'next/router';
import type { Context } from 'next';

import type { RequestAdditions } from '../server/next-handlers';

import withStore from '../lib/mixins/with-store';

import Nav from '../components/common/Nav';
import LocationMap from '../components/common/LocationMap';
import StartFormContainer from '../components/report-start';
import ReportFormContainer from '../components/report-form';

import makeLoopbackGraphql from '../data/graphql/loopback-graphql';
import type { LoopbackGraphql } from '../data/graphql/loopback-graphql';

import type { Service, ServiceArgs, ServiceSummary } from '../data/types';
import LoadServiceGraphql from '../data/graphql/LoadServiceSummaries.graphql';
import LoadServiceSummariesGraphql from '../data/graphql/LoadService.graphql';

type SummaryProps = {
  view: 'summaries',
  serviceSummaries: ?ServiceSummary[],
};

type ServiceProps = {
  view: 'service',
  code: string,
  service: ?Service,
};

type InitialProps = SummaryProps | ServiceProps;

class Report extends React.Component {
  static async getInitialProps({ query, req, res }: Context<RequestAdditions>): Promise<InitialProps> {
    const { code } = query;
    const loopbackGraphql = makeLoopbackGraphql(req);

    if (code) {
      const service = (await loopbackGraphql(LoadServiceSummariesGraphql, ({ code }: ServiceArgs))).service;

      if (!service && res) {
        // eslint-disable-next-line no-param-reassign
        res.statusCode = 404;
      }

      return {
        view: 'service',
        code,
        service,
      };
    } else {
      return {
        view: 'summaries',
        serviceSummaries: (await loopbackGraphql(LoadServiceGraphql)).services,
      };
    }
  }

  constructor(props) {
    super(props);

    this.loopbackGraphql = makeLoopbackGraphql();
  }

  props: InitialProps;
  loopbackGraphql: LoopbackGraphql;

  showServiceForm = (code) => {
    // TODO(finh): Use "url" prop if we have a better way of pulling it off
    // type-safely (probably after rest spreads land)
    Router.push(`/report?code=${code}`, `/report/${code}`);
  }

  render() {
    return (
      <div>
        <Head>
          <title>BOS:311 — {this.renderTitle()}</title>
        </Head>

        <Nav />
        <LocationMap />

        {this.renderContent()}
      </div>
    );
  }

  renderTitle() {
    switch (this.props.view) {
      case 'summaries': return 'Report a Problem';
      case 'service': return this.props.service ? this.props.service.name : 'Not found';
      default: return '';
    }
  }

  renderContent() {
    switch (this.props.view) {
      case 'summaries':
        return (
          <StartFormContainer serviceSummaries={this.props.serviceSummaries} showServiceForm={this.showServiceForm} />
        );

      case 'service':
        return (
          <ReportFormContainer service={this.props.service} loopbackGraphql={this.loopbackGraphql} />
        );

      default:
        return null;
    }
  }
}

export default withStore(Report);
