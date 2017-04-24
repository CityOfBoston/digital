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

import { MEDIA_LARGE, CENTERED_DIALOG_STYLE } from '../../style-constants';

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

const CORNER_DIALOG_STYLE = css(COMMON_DIALOG_STYLE, {
  margin: 0,
  [MEDIA_LARGE]: {
    margin: '-0px 70% 0 40px',
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

  makeNextAfterQuestions(): { fn: () => mixed, isSubmit: boolean } {
    const { store: { requestForm } } = this.props;

    if (requestForm.locationInfo.ask) {
      return {
        fn: this.routeToLocation,
        isSubmit: false,
      };
    } else if (requestForm.contactInfo.ask) {
      return {
        fn: this.routeToContact,
        isSubmit: false,
      };
    } else {
      return {
        fn: this.submitRequest,
        isSubmit: true,
      };
    }
  }

  makeNextAfterLocation(): { fn: () => mixed, isSubmit: boolean } {
    const { store: { requestForm } } = this.props;

    if (requestForm.contactInfo.ask) {
      return {
        fn: this.routeToContact,
        isSubmit: false,
      };
    } else {
      return {
        fn: this.submitRequest,
        isSubmit: true,
      };
    }
  }

  routeToLocation = () => {
    const { store: { currentService }, routeToServiceForm } = this.props;
    if (currentService) {
      routeToServiceForm(currentService.code, 'location');
    }
  }

  routeToContact = () => {
    const { store: { currentService }, routeToServiceForm } = this.props;
    if (currentService) {
      routeToServiceForm(currentService.code, 'contact');
    }
  }

  @action.bound
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
    const dialogContainerStyle = stage === 'location' ? CORNER_DIALOG_STYLE : css(COMMON_DIALOG_STYLE, CENTERED_DIALOG_STYLE);

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
      case 'questions': {
        const { fn, isSubmit } = this.makeNextAfterQuestions();
        return <QuestionsPane store={store} nextFunc={fn} nextIsSubmit={isSubmit} />;
      }

      case 'location': {
        const { fn, isSubmit } = this.makeNextAfterLocation();
        return <LocationPopUp store={store} nextFunc={fn} nextIsSubmit={isSubmit} loopbackGraphql={loopbackGraphql} />;
      }

      case 'contact':
        return <ContactPane store={store} nextFunc={this.submitRequest} />;

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
