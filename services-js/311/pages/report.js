// @flow

import React from 'react';
import Head from 'next/head';
import Router from 'next/router';
import { rehydrate } from 'glamor';
import type { Context } from 'next';

import type { RequestAdditions } from '../server/next-handlers';

import withStore from '../lib/mixins/with-store';
import getStore from '../data/store';

import makeLoopbackGraphql from '../data/graphql/loopback-graphql';
import type { LoopbackGraphql } from '../data/graphql/loopback-graphql';

import type { ServiceSummary, ServiceArgs } from '../data/types';
import LoadServiceGraphql from '../data/graphql/LoadServiceSummaries.graphql';
import LoadServiceSummariesGraphql from '../data/graphql/LoadService.graphql';
import type { InitialProps } from '../components/layouts/ReportLayout';

if (process.browser) {
  // eslint-disable-next-line no-underscore-dangle
  rehydrate(window.__NEXT_DATA__.ids);
}

// Use 'require' so this executes after the glamor rehydration
const ReportLayout = require('../components/layouts/ReportLayout').default;

export class Report extends React.Component {
  props: InitialProps;
  loopbackGraphql: LoopbackGraphql;

  static async getInitialProps({ query, req, res }: Context<RequestAdditions>): Promise<InitialProps> {
    const { code, pickLocation } = query;
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
        pickLocation: pickLocation === 'true',
      };
    } else {
      return {
        view: 'summaries',
        serviceSummaries: (await loopbackGraphql(LoadServiceGraphql)).services,
        pickLocation: false,
      };
    }
  }

  constructor(props: InitialProps) {
    super(props);

    this.loopbackGraphql = makeLoopbackGraphql();
  }

  showServiceForm = (serviceSummary: ServiceSummary) => {
    // TODO(finh): Use "url" prop if we have a better way of pulling it off
    // type-safely (probably after rest spreads land)
    if (serviceSummary.locationRequired) {
      Router.push(`/report?code=${serviceSummary.code}&pickLocation=true`, `/report/${serviceSummary.code}/location`);
    } else {
      Router.push(`/report?code=${serviceSummary.code}`, `/report/${serviceSummary.code}`);
    }
  }

  goToReportForm = () => {
    if (this.props.view === 'service') {
      const { code } = this.props;
      Router.push(`/report?code=${code}`, `/report/${code}`);
    }
  }

  render() {
    const initialProps = this.props;

    return (
      <div>
        <Head>
          <title>BOS:311 — {ReportLayout.getTitle(initialProps)}</title>
        </Head>

        <ReportLayout
          initialProps={initialProps}
          loopbackGraphql={this.loopbackGraphql}
          showServiceForm={this.showServiceForm}
          goToReportForm={this.goToReportForm}
        />
      </div>
    );
  }
}

export default withStore(getStore)(Report);
