// @flow

import React from 'react';
import Head from 'next/head';
import { action } from 'mobx';
import ScopedError from 'react-scoped-error-component';
import { observer } from 'mobx-react';
import { fromPromise } from 'mobx-utils';
import { css } from 'glamor';

import type { AppStore } from '../../../data/store';
import type { LoopbackGraphql } from '../../../data/dao/loopback-graphql';
import submitRequest from '../../../data/dao/submit-request';

import FormDialog from '../../common/FormDialog';
import SectionHeader from '../../common/SectionHeader';
import { SMALL_SCREEN } from '../../style-constants';

import QuestionsPane from './QuestionsPane';
import LocationPopUp from './LocationPopUp';
import ContactPane from './ContactPane';
import SubmitPane from './SubmitPane';

type Props = {
  store: AppStore,
  stage: 'questions' | 'location' | 'contact' | 'submit',
  loopbackGraphql: LoopbackGraphql,
  routeToServiceForm: (code: string, stage: string) => Promise<void>,
  setLocationMapActive: (active: boolean) => void,
  locationMapSearch: ?(query: string) => Promise<boolean>,
}

const COMMON_DIALOG_STYLE = {
  transition: 'margin 400ms',
};

const CENTERED_DIALOG_STYLE = css(COMMON_DIALOG_STYLE, {
});

const CORNER_DIALOG_STYLE = css(COMMON_DIALOG_STYLE, {
  margin: '-60px 60% 0 20px',
  [SMALL_SCREEN]: {
    margin: 0,
  },
});

@observer
export default class RequestDialog extends React.Component {
  props: Props;

  componentWillMount() {
    const { stage, setLocationMapActive } = this.props;
    setLocationMapActive(stage === 'location');
  }

  @action
  componentWillReceiveProps(newProps: Props) {
    const { setLocationMapActive, stage } = this.props;

    if (stage !== newProps.stage) {
      setLocationMapActive(newProps.stage === 'location');
    }
  }

  nextAfterQuestions = () => {
    const { store: { currentService }, routeToServiceForm } = this.props;
    if (currentService) {
      routeToServiceForm(currentService.code, 'location');
    }
  }

  nextAfterLocation = () => {
    const { store: { currentService }, routeToServiceForm } = this.props;
    if (currentService) {
      routeToServiceForm(currentService.code, 'contact');
    }
  }

  nextAfterContact = () => {
    this.submitRequest();
  }

  @action
  submitRequest(): Promise<mixed> {
    const { store, loopbackGraphql, routeToServiceForm } = this.props;
    const { currentService, contactInfo, locationInfo, description, questions, mediaUrl } = store;

    if (!currentService) {
      throw new Error('currentService is null in submitRequest');
    }

    const promise = submitRequest(loopbackGraphql, {
      service: currentService,
      description,
      contactInfo,
      locationInfo,
      questions,
      mediaUrl,
    });

    store.requestSubmission = fromPromise(promise);

    routeToServiceForm(currentService.code, 'submit');

    return promise;
  }

  render() {
    const { stage } = this.props;
    const dialogContainerStyle = stage === 'location' ? CORNER_DIALOG_STYLE : CENTERED_DIALOG_STYLE;

    return (
      <div className={dialogContainerStyle}>
        <Head>
          <title>BOS:311 — {this.renderTitle()}</title>
        </Head>

        <FormDialog small={stage === 'location'} narrow={stage === 'contact'}>
          { this.renderContent() }
        </FormDialog>
      </div>
    );
  }

  renderTitle() {
    const { stage, store: { currentService, requestSubmission } } = this.props;

    if (!currentService) {
      return 'Not Found';
    }

    switch (stage) {
      case 'questions': return currentService.name;
      case 'location': return 'Choose location';
      case 'contact': return 'Contact information';
      case 'submit':
        if (!requestSubmission) {
          return '';
        }

        switch (requestSubmission.state) {
          case 'pending': return 'Submitting…';
          case 'fulfilled': return `Success: Case ${requestSubmission.value.id}`;
          case 'rejected': return 'Submission error';
          default: return '';
        }

      default: return '';
    }
  }

  renderContent() {
    const { store, stage, locationMapSearch } = this.props;
    const { currentService, currentServiceError, requestSubmission } = store;

    if (!currentService) {
      return <SectionHeader>Service not found</SectionHeader>;
    }

    if (currentServiceError) {
      return (
        <div>
          <SectionHeader>Error loading service</SectionHeader>
          <ScopedError error={currentServiceError} />
        </div>
      );
    }

    switch (stage) {
      case 'questions':
        return <QuestionsPane store={store} nextFunc={this.nextAfterQuestions} />;

      case 'location':
        return <LocationPopUp store={store} nextFunc={this.nextAfterLocation} addressSearch={locationMapSearch} />;

      case 'contact':
        return <ContactPane store={store} nextFunc={this.nextAfterContact} />;

      case 'submit':
        if (!requestSubmission) {
          return '';
        }

        switch (requestSubmission.state) {
          case 'pending': return <SubmitPane state="submitting" />;
          case 'fulfilled': return <SubmitPane state="success" submittedRequest={requestSubmission.value} />;
          case 'rejected': return <SubmitPane state="error" error={requestSubmission.value} />;
          default: return '';
        }

      default: return null;
    }
  }
}
