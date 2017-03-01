// @flow
/* eslint react/no-unused-prop-types: 0 */

import React from 'react';
import { css } from 'glamor';

import Nav from '../common/Nav';
import LocationMap from '../location';
import StartFormContainer from '../report-start';
import ReportFormContainer from '../report-form';

import type { LoopbackGraphql } from '../../data/graphql/loopback-graphql';
import type { Service, ServiceSummary } from '../../data/types';

type ServiceProps = {
  view: 'service',
  code: string,
  service: ?Service,
  pickLocation: boolean,
};

type SummaryProps = {
  view: 'summaries',
  serviceSummaries: ?ServiceSummary[],
  pickLocation: boolean,
};

export type InitialProps = ServiceProps | SummaryProps;

export type Props = {
  initialProps: InitialProps,
  loopbackGraphql: LoopbackGraphql,
  showServiceForm: (ServiceSummary) => void,
  goToReportForm: () => void,
}

const CONTAINER_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  marginTop: -55,
});

const CONTENT_STYLE = css({
  flex: 1,
  position: 'relative',
});

export default class ReportLayout extends React.Component {
  props: Props;

  static getTitle(initialProps: InitialProps) {
    switch (initialProps.view) {
      case 'summaries': return 'Report a Problem';
      case 'service': {
        const { service, pickLocation } = initialProps;

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

  render() {
    const { initialProps: { pickLocation }, goToReportForm } = this.props;

    return (
      <div className={CONTAINER_STYLE}>
        <Nav />
        <div className={CONTENT_STYLE}>
          <LocationMap active={pickLocation} goToReportForm={goToReportForm} />
          {this.renderContent()}
        </div>
      </div>
    );
  }

  renderContent() {
    const { initialProps, showServiceForm, loopbackGraphql } = this.props;

    switch (initialProps.view) {
      case 'summaries':
        return (
          <StartFormContainer serviceSummaries={initialProps.serviceSummaries} showServiceForm={showServiceForm} />
        );

      case 'service': {
        const { service, pickLocation } = initialProps;
        if (pickLocation) {
          return null;
        } else {
          return <ReportFormContainer service={service} loopbackGraphql={loopbackGraphql} />;
        }
      }

      default:
        return null;
    }
  }
}
