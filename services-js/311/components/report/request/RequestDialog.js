// @flow

import React from 'react';
import Head from 'next/head';
import { observable, action } from 'mobx';
import ScopedError from 'react-scoped-error-component';
import { observer } from 'mobx-react';
import { fromPromise } from 'mobx-utils';
import type { IPromiseBasedObservable } from 'mobx-utils';
import { css } from 'glamor';

import type { AppStore } from '../../../data/store';
import type { LoopbackGraphql } from '../../../data/graphql/loopback-graphql';
import type { SubmitRequestMutation } from '../../../data/graphql/schema.flow';

import FormDialog from '../../common/FormDialog';
import SectionHeader from '../../common/SectionHeader';

import QuestionsPane from './QuestionsPane';
import LocationPopUp from './LocationPopUp';
import ContactPane from './ContactPane';
import SubmitPane from './SubmitPane';

type Props = {
  store: AppStore,
  stage: 'questions' | 'location' | 'contact',
  loopbackGraphql: LoopbackGraphql,
  routeToServiceForm: (code: string, stage: string) => void,
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
});

@observer
export default class RequestDialog extends React.Component {
  props: Props;
  @observable submission: ?IPromiseBasedObservable<SubmitRequestMutation> = null;

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

    this.submission = null;
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
    const { store, loopbackGraphql } = this.props;
    const promise = store.submitRequest(loopbackGraphql);
    this.submission = fromPromise(promise);
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

        <FormDialog>
          { this.renderContent() }
        </FormDialog>
      </div>
    );
  }

  renderTitle() {
    const { stage, store: { currentService } } = this.props;

    if (!currentService) {
      return 'Not Found';
    }

    if (this.submission) {
      switch (this.submission.state) {
        case 'pending': return 'Submitting…';
        case 'fulfilled': return `Success: Case ${this.submission.value.createRequest.id}`;
        case 'rejected': return 'Submission error';
        default: return '';
      }
    }

    switch (stage) {
      case 'questions': return currentService.name;
      case 'location': return 'Choose location';
      case 'contact': return 'Contact information';
      default: return '';
    }
  }

  renderContent() {
    const { store, stage, locationMapSearch } = this.props;
    const { currentService, currentServiceError } = store;

    if (this.submission) {
      switch (this.submission.state) {
        case 'pending': return <SubmitPane state="submitting" />;
        case 'fulfilled': return <SubmitPane state="success" submittedRequest={this.submission.value.createRequest} />;
        case 'rejected': return <SubmitPane state="error" error={this.submission.value} />;
        default: return '';
      }
    }

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

      default: return null;
    }
  }
}
