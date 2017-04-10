// @flow

import React from 'react';
import Head from 'next/head';
import { action, observable } from 'mobx';
import ScopedError from 'react-scoped-error-component';
import { observer } from 'mobx-react';
import { fromPromise } from 'mobx-utils';
import { css } from 'glamor';
import type { IPromiseBasedObservable } from 'mobx-utils';

import type { SubmittedRequest } from '../../../data/types';
import type { AppStore } from '../../../data/store';
import type { LoopbackGraphql } from '../../../data/dao/loopback-graphql';
import submitRequest from '../../../data/dao/submit-request';

import FormDialog from '../../common/FormDialog';
import SectionHeader from '../../common/SectionHeader';

import { MEDIA_LARGE } from '../../style-constants';

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
}

const COMMON_DIALOG_STYLE = {
  transition: 'margin 400ms',
};

const CENTERED_DIALOG_STYLE = css(COMMON_DIALOG_STYLE, {
});

const CORNER_DIALOG_STYLE = css(COMMON_DIALOG_STYLE, {
  margin: 0,
  [MEDIA_LARGE]: {
    margin: '-30px 70% 0 20px',
    minWidth: 400,
  },
});

@observer
export default class RequestDialog extends React.Component {
  props: Props;

  @observable requestSubmission: ?IPromiseBasedObservable<SubmittedRequest> = null;

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
    const { currentService, requestForm } = store;
    const { contactInfo, locationInfo, description, questions, mediaUrl } = requestForm;

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
    }).then((v) => {
      store.resetRequest();
      return v;
    });

    this.requestSubmission = fromPromise(promise);

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

        <FormDialog narrow={stage === 'contact'} popup={stage === 'location'}>
          { this.renderContent() }
        </FormDialog>
      </div>
    );
  }

  renderTitle() {
    const { requestSubmission } = this;
    const { stage, store: { currentService } } = this.props;

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
    const { requestSubmission } = this;
    const { store, stage, loopbackGraphql } = this.props;
    const { currentService, currentServiceError } = store;

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
        return <LocationPopUp store={store} nextFunc={this.nextAfterLocation} loopbackGraphql={loopbackGraphql} />;

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
