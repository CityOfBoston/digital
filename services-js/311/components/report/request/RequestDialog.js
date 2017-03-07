// @flow

import React from 'react';
import Head from 'next/head';
import { css } from 'glamor';

import type { Service, SubmittedRequest, Request } from '../../../data/types';
import type { LoopbackGraphql } from '../../../data/graphql/loopback-graphql';
import { submitRequest } from '../../../data/store/request';

import FormDialog from '../../common/FormDialog';
import SectionHeader from '../../common/SectionHeader';

import { QuestionsPaneContainer, ContactPaneContainer, LocationPopUpContainer } from './containers';
import SubmitPane from './SubmitPane';

type ExternalProps = {
  service: ?Service,
  stage: 'questions' | 'location' | 'contact',
  loopbackGraphql: LoopbackGraphql,
  routeToServiceForm: (code: string, stage: string) => void,
  setLocationMapActive: (active: boolean) => void,
  locationMapSearch: ?(query: string) => Promise<boolean>,
};

export type ValueProps = {
  request: Request,
}

export type ActionProps = {
  resetRequestForService: (service: Service) => void,
}

type Props = ExternalProps & ValueProps & ActionProps;

const COMMON_DIALOG_STYLE = {
  transition: 'margin 400ms',
};

const CENTERED_DIALOG_STYLE = css(COMMON_DIALOG_STYLE, {
});

const CORNER_DIALOG_STYLE = css(COMMON_DIALOG_STYLE, {
  margin: '-60px 60% 0 20px',
});

/*
  <LocationPopUp address={address} addressSearch={this.whenAddressSearch} next={this.whenNextClicked} />
*/

export default class RequestDialog extends React.Component {
  props: Props;
  state: {
    submitting: boolean,
    submitError: ?Object,
    submittedRequest: ?SubmittedRequest,
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      submitting: false,
      submitError: null,
      submittedRequest: null,
    };
  }

  componentWillMount() {
    const { service, resetRequestForService, stage, setLocationMapActive } = this.props;
    if (service) {
      resetRequestForService(service);
    }

    setLocationMapActive(stage === 'location');
  }

  componentWillReceiveProps(newProps: Props) {
    const { setLocationMapActive, stage } = this.props;

    if (stage !== newProps.stage) {
      setLocationMapActive(newProps.stage === 'location');
    }
  }

  nextAfterQuestions = () => {
    const { service, routeToServiceForm } = this.props;
    if (service) {
      routeToServiceForm(service.code, 'location');
    }
  }

  nextAfterLocation = () => {
    const { service, routeToServiceForm } = this.props;
    if (service) {
      routeToServiceForm(service.code, 'contact');
    }
  }

  nextAfterContact = () => {
    this.submitRequest();
  }

  submitRequest = async () => {
    // Pull the store out of the context rather than via connect because we
    // don't need it for rendering, just for doing this submission.
    this.setState({
      submitting: true,
      submitError: null,
      submittedRequest: null,
    });

    try {
      const { request, loopbackGraphql } = this.props;
      const { createRequest } = await submitRequest(request, loopbackGraphql);

      this.setState({
        submitting: false,
        submittedRequest: createRequest,
      });
    } catch (e) {
      this.setState({
        submitError: e,
      });
    }
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
    const { stage, service } = this.props;
    const { submitting, submitError, submittedRequest } = this.state;

    if (!service) {
      return 'Not Found';
    }

    if (submitError) {
      return 'Submission error';
    } else if (submitting) {
      return 'Submitting…';
    } else if (submittedRequest) {
      return `Success: Case ${submittedRequest.id}`;
    }

    switch (stage) {
      case 'questions': return service.name;
      case 'location': return 'Choose location';
      case 'contact': return 'Contact information';
      default: return '';
    }
  }

  renderContent() {
    const { service, stage, locationMapSearch } = this.props;
    const { submitting, submitError, submittedRequest } = this.state;

    if (submitError) {
      return <SubmitPane state="error" error={submitError} />;
    } else if (submitting) {
      return <SubmitPane state="submitting" />;
    } else if (submittedRequest) {
      return <SubmitPane state="success" submittedRequest={submittedRequest} />;
    }

    if (!service) {
      return <SectionHeader>Service not found</SectionHeader>;
    }

    switch (stage) {
      case 'questions':
        return <QuestionsPaneContainer nextFunc={this.nextAfterQuestions} />;

      case 'location':
        return <LocationPopUpContainer nextFunc={this.nextAfterLocation} addressSearch={locationMapSearch} />;

      case 'contact':
        return <ContactPaneContainer service={service} nextFunc={this.nextAfterContact} />;

      default: return null;
    }
  }
}
