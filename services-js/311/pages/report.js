// @flow

import React from 'react';
import Head from 'next/head';
import Router from 'next/router';
import type { Context } from 'next';

import type { RequestAdditions } from '../server/next-handlers';

import withStore from '../lib/mixins/with-store';

import Nav from '../components/common/Nav';
import LocationMap from '../components/location';
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
  pickLocation: boolean,
};

type ServiceProps = {
  view: 'service',
  code: string,
  service: ?Service,
  pickLocation: boolean,
};

type InitialProps = SummaryProps | ServiceProps;

class Report extends React.Component {
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

  constructor(props) {
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
    const { pickLocation } = this.props;

    return (
      <div>
        <Head>
          <title>BOS:311 — {this.renderTitle()}</title>
        </Head>

        <Nav />
        <LocationMap active={pickLocation} goToReportForm={this.goToReportForm} />

        {this.renderContent()}
      </div>
    );
  }

  renderTitle() {
    switch (this.props.view) {
      case 'summaries': return 'Report a Problem';
      case 'service': {
        const { service, pickLocation } = this.props;

        if (pickLocation) {
          return 'Choose location';
        } else if (service) {
          return service.name;
        } else {
          return 'Not found';
        }
      }
      default: return '';
    }
  }

  renderContent() {
    switch (this.props.view) {
      case 'summaries':
        return (
          <StartFormContainer serviceSummaries={this.props.serviceSummaries} showServiceForm={this.showServiceForm} />
        );

      case 'service': {
        const { service, pickLocation } = this.props;
        if (pickLocation) {
          return null;
        } else {
          return <ReportFormContainer service={service} loopbackGraphql={this.loopbackGraphql} />;
        }
      }

      default:
        return null;
    }
  }
}

export default withStore(Report);
