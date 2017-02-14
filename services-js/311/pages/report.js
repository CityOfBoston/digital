// @flow

import React from 'react';
import Head from 'next/head';
import type { Context } from 'next';
import { connect } from 'react-redux';

import type { RequestAdditions } from '../server/next-handlers';
import { loadServices } from '../store/modules/services';
import type { Store, State } from '../store';

import withStore from '../lib/mixins/with-store';
import withStoreRoute from '../lib/mixins/with-store-route';

import Nav from '../components/common/Nav';
import FormDialog from '../components/common/FormDialog';
import LocationMap from '../components/common/LocationMap';
import ReportFormContainer from '../components/report/ReportFormContainer';
import CompleteFormContainer from '../components/complete/CompleteFormContainer';
import ContactFormContainer from '../components/contact/ContactFormContainer';

const mapStateToProps = ({ keys }: State) => ({
  googleApiKey: keys.googleApi,
});

class ReportBase extends React.Component {
  static determineStep(step, requestState) {
    if (step !== 'submit') {
      // TODO(finh): make sure state has data for step
      return step;
    } else if (requestState.description && requestState.code) {
      return 'complete';
    } else {
      return 'report';
    }
  }

  static async getInitialProps({ query }: Context<RequestAdditions>, store: Store) {
    const step = this.determineStep(query.step, store.getState().request);

    if (step === 'report') {
      await store.dispatch(loadServices());
    }

    return {
      step,
    };
  }

  render() {
    const { step, googleApiKey } = this.props;

    return (
      <div>
        <Head>
          <title>BOS:311 — {this.renderTitle(step)}</title>
        </Head>

        <Nav />

        <LocationMap googleApiKey={googleApiKey} />

        { this.renderContent(step) }
      </div>
    );
  }

  renderTitle(step) {
    switch (step) {
      case 'report':
        return 'Report a Problem';
      case 'contact':
        return 'Contact Information';
      case 'complete':
        return 'Report Submitted';
      default:
        return '';
    }
  }

  renderContent(step) {
    switch (step) {
      case 'report':
        return (
          <FormDialog title="311: Boston City Services">
            <ReportFormContainer />
          </FormDialog>
        );
      case 'contact':
        return (
          <FormDialog>
            <ContactFormContainer />
          </FormDialog>
        );
      case 'complete':
        return (
          <FormDialog title="Form Submitted">
            <CompleteFormContainer />
          </FormDialog>
        );
      default:
        return null;
    }
  }
}

export default withStore(withStoreRoute(connect(mapStateToProps)(ReportBase)));
