// @flow

import React from 'react';
import Head from 'next/head';
import type { Context } from 'next';

import type { RequestAdditions } from '../server/next-handlers';

import withStore from '../lib/mixins/with-store';
import withStoreRoute from '../lib/mixins/with-store-route';

import Nav from '../components/common/Nav';
import FormDialog from '../components/common/FormDialog';
import LocationMap from '../components/common/LocationMap';
import ReportFormContainer from '../components/report/ReportFormContainer';
import ServiceFormDialog from '../components/service/ServiceFormDialog';

import makeLoopbackGraphql from '../data/graphql/loopback-graphql';

import type { Service, ServiceArgs, ServiceSummary } from '../data/types';
import LoadServiceGraphql from '../data/graphql/LoadServiceSummaries.graphql';
import LoadServiceSummariesGraphql from '../data/graphql/LoadService.graphql';

type SummaryProps = {|
  view: 'summaries',
  serviceSummaries: ?ServiceSummary[],
|};

type ServiceProps = {|
  view: 'service',
  code: string,
  service: ?Service,
|};

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

  props: InitialProps;

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
          <FormDialog title="311: Boston City Services">
            <ReportFormContainer serviceSummaries={this.props.serviceSummaries} />
          </FormDialog>
        );

      case 'service':
        return (
          <ServiceFormDialog service={this.props.service} />
        );

      default:
        return null;
    }
  }
}

export default withStore(withStoreRoute(Report));
