import React from 'react';
import Head from 'next/head';
import Router from 'next/router';
import { action, observable, autorun } from 'mobx';
import { observer } from 'mobx-react';
import { fromPromise } from 'mobx-utils';
import { css } from 'emotion';
import { IPromiseBasedObservable } from 'mobx-utils';
import {
  FetchGraphql,
  ScreenReaderSupport,
  getParam,
} from '@cityofboston/next-client-common';

import { MEDIA_LARGE, HEADER_HEIGHT } from '@cityofboston/react-fleet';

import { SubmittedRequest, Service } from '../../../data/types';
import Ui from '../../../data/store/Ui';
import AddressSearch from '../../../data/store/AddressSearch';
import RequestSearch from '../../../data/store/RequestSearch';
import BrowserLocation from '../../../data/store/BrowserLocation';
import RequestForm from '../../../data/store/RequestForm';
import submitRequest from '../../../data/queries/submit-request';
import loadService from '../../../data/queries/load-service';

import LoadingBuildings from '../../common/LoadingBuildings';
import FormDialog from '../../common/FormDialog';
import SectionHeader from '../../common/SectionHeader';

import { CENTERED_DIALOG_STYLE } from '../../style-constants';

import QuestionsPane from './QuestionsPane';
import LocationPopUp from './LocationPopUp';
import ContactPane from './ContactPane';
import SubmitPane from './SubmitPane';
import CaseView from '../../case/CaseView';
import { GetInitialProps } from '../../../pages/_app';

export type InitialProps = {
  stage: 'questions' | 'location' | 'contact' | 'submit';
  service: Service | null;
  serviceCode: string;
  description: string;
};

export type Props = InitialProps & {
  fetchGraphql: FetchGraphql;
  addressSearch: AddressSearch;
  browserLocation: BrowserLocation;
  requestSearch: RequestSearch;
  screenReaderSupport: ScreenReaderSupport;
  ui: Ui;
  routeToServiceForm: (code: string, stage: string) => Promise<void>;
  setLocationMapActive: (active: boolean) => void;
};

const COMMON_DIALOG_STYLE = css({
  transition: 'margin 400ms',
  position: 'relative',
  zIndex: 2,
});

export const CORNER_DIALOG_STYLE = css(COMMON_DIALOG_STYLE, {
  margin: 0,
  [MEDIA_LARGE]: {
    // 350px height estimate for the dialog
    margin: `-0px 70% calc(100vh - ${HEADER_HEIGHT}px - 300px) 40px`,
    minWidth: 370,
  },
});

@observer
export default class RequestDialog extends React.Component<Props> {
  requestForm: RequestForm;
  @observable
  requestSubmission: IPromiseBasedObservable<SubmittedRequest> | null = null;

  caseLookupOnSubmitDisposer: Function | null = null;

  // Called by RequestLayout
  static getInitialProps: GetInitialProps<
    InitialProps,
    'query' | 'res',
    'fetchGraphql'
  > = async ({ query, res }, { fetchGraphql }): Promise<InitialProps> => {
    const { description } = query;
    // We can't be routed to here unless code is provided
    const code = getParam(query.code)!;

    let stage = query.stage;

    const service = await loadService(fetchGraphql, code);

    if (!service && res) {
      res.statusCode = 404;
    }

    stage = stage || 'questions';

    switch (stage) {
      case 'questions':
      case 'location':
      case 'contact':
      case 'submit':
        return {
          serviceCode: code,
          service,
          stage,
          description: getParam(description, ''),
        };
      default:
        throw new Error(`Unknown stage: ${stage}`);
    }
  };

  constructor(props: Props) {
    super(props);

    const { description, service } = this.props;

    this.requestForm = new RequestForm(service);
    this.requestForm.description = description;
    this.requestForm.descriptionForClassifier = description;
  }

  @action
  componentWillMount() {
    const { stage, setLocationMapActive } = this.props;
    setLocationMapActive(stage === 'location');
  }

  componentDidMount() {
    LoadingBuildings.preload();

    this.caseLookupOnSubmitDisposer = autorun(
      () => {
        if (
          this.requestSubmission &&
          this.requestSubmission.state === 'fulfilled'
        ) {
          const { id } = this.requestSubmission.value;
          // We keep the first URL the same to avoid a page load, but change the
          // "as" to match the URL for the case permalink.
          Router.replace('/request', `/reports/${id}`, {
            shallow: true,
          });
        }
      },
      { name: 'route on case submit' }
    );
  }

  componentWillUnmount() {
    if (this.caseLookupOnSubmitDisposer) {
      this.caseLookupOnSubmitDisposer();
    }
  }

  @action
  componentWillReceiveProps(newProps: Props) {
    const { setLocationMapActive, stage } = this.props;

    if (stage !== newProps.stage) {
      setLocationMapActive(newProps.stage === 'location');
    }
  }

  makeNextAfterQuestions(): { fn: () => unknown; isSubmit: boolean } {
    const { requestForm } = this;

    if (requestForm.showLocationPicker) {
      return {
        fn: this.routeToLocation,
        isSubmit: false,
      };
    } else if (requestForm.showContactInfoForm) {
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

  makeNextAfterLocation(): { fn: () => unknown; isSubmit: boolean } {
    const { requestForm } = this;

    if (requestForm.showContactInfoForm) {
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
    const { service, routeToServiceForm } = this.props;
    if (service) {
      routeToServiceForm(service.code, 'location');
    }
  };

  routeToContact = () => {
    const { service, routeToServiceForm } = this.props;
    if (service) {
      routeToServiceForm(service.code, 'contact');
    }
  };

  @action.bound
  submitRequest(): PromiseLike<unknown> {
    const { requestForm } = this;
    const { service, fetchGraphql, routeToServiceForm } = this.props;
    const {
      description,
      descriptionForClassifier,
      firstName,
      lastName,
      email,
      phone,
      location,
      address,
      addressId,
      addressIntent,
      questions,
      mediaUrl,
      sendLocation,
      sendContactInfo,
    } = requestForm;

    if (!service) {
      throw new Error('service is null in submitRequest');
    }

    const promise = submitRequest(fetchGraphql, {
      service,
      description,
      descriptionForClassifier,
      // We only send contact info with an affirmative boolean that's set by
      // the ContactPane form's submit button. That way contact info that was
      // loaded by localStorage won't be pushed to the server if the user didn't
      // see the contact info form or chose "submit without sending contact info"
      firstName: sendContactInfo ? firstName : '',
      lastName: sendContactInfo ? lastName : '',
      email: sendContactInfo ? email : '',
      phone: sendContactInfo ? phone : '',
      location: sendLocation && addressIntent === 'LATLNG' ? location : null,
      address: sendLocation && addressIntent === 'ADDRESS' ? address : null,
      addressId: sendLocation ? addressId : null,
      questions,
      mediaUrl,
    }).then(
      v => {
        // upload was successful, so clear out previous request state
        this.requestForm = new RequestForm(service);
        return v;
      },
      err => {
        if (window.Rollbar && err.source !== 'server') {
          window.Rollbar.error(err);
          err._sentToRollbar = true;
        }

        // This exception is ultimately "caught" by the requestSubmission fromPromise
        // mobx handler.
        throw err;
      }
    );

    const mobxWrappedPromise = fromPromise(promise);
    this.requestSubmission = mobxWrappedPromise;

    routeToServiceForm(service.code, 'submit');

    // fromPromise returns a promise
    return mobxWrappedPromise;
  }

  render() {
    const { stage } = this.props;
    const dialogContainerStyle =
      stage === 'location'
        ? CORNER_DIALOG_STYLE
        : css(COMMON_DIALOG_STYLE, CENTERED_DIALOG_STYLE);

    return (
      <div className={dialogContainerStyle}>
        <Head>
          <title>BOS:311 — {this.renderTitle()}</title>
        </Head>

        <FormDialog
          narrow={stage === 'contact'}
          noPadding={stage === 'location'}
        >
          {this.renderContent()}
        </FormDialog>
      </div>
    );
  }

  renderTitle() {
    const { requestSubmission } = this;
    const { stage, service } = this.props;

    if (!service) {
      return 'Not Found';
    }

    switch (stage) {
      case 'questions':
        return service.name;
      case 'location':
        return 'Choose location';
      case 'contact':
        return 'Contact information';
      case 'submit':
        if (!requestSubmission) {
          return '';
        }

        switch (requestSubmission.state) {
          case 'pending':
            return 'Submitting…';
          case 'fulfilled':
            return `Success: Case ${requestSubmission.value.id}`;
          case 'rejected':
            return 'Submission error';
          default:
            return '';
        }

      default:
        return '';
    }
  }

  renderContent() {
    const { requestSubmission, requestForm } = this;
    const {
      stage,
      service,
      serviceCode,
      ui,
      addressSearch,
      browserLocation,
      requestSearch,
      screenReaderSupport,
    } = this.props;

    if (!service) {
      return (
        <div style={{ minHeight: '50vh' }}>
          <SectionHeader>Service not found</SectionHeader>

          <div className="m-v400 t--intro">
            We couldn’t load a service for code <strong>{serviceCode}</strong>.
          </div>

          <div className="m-v400 t--info">
            The link you followed may be outdated, or this service is not
            available at the moment.
          </div>
        </div>
      );
    }

    switch (stage) {
      case 'questions': {
        const { fn, isSubmit } = this.makeNextAfterQuestions();
        return (
          <QuestionsPane
            requestForm={requestForm}
            serviceName={service.name}
            serviceDescription={service.description}
            nextFunc={fn}
            nextIsSubmit={isSubmit}
          />
        );
      }

      case 'location': {
        const { fn, isSubmit } = this.makeNextAfterLocation();
        return (
          <LocationPopUp
            addressSearch={addressSearch}
            browserLocation={browserLocation}
            ui={ui}
            requestSearch={requestSearch}
            screenReaderSupport={screenReaderSupport}
            requestForm={requestForm}
            nextFunc={fn}
            nextIsSubmit={isSubmit}
          />
        );
      }

      case 'contact':
        return (
          <ContactPane
            requestForm={requestForm}
            serviceName={service.name}
            nextFunc={this.submitRequest}
          />
        );

      case 'submit':
        if (!requestSubmission) {
          return '';
        }

        switch (requestSubmission.state) {
          case 'pending':
            return <SubmitPane state="submitting" ui={ui} />;
          case 'fulfilled':
            return <CaseView request={requestSubmission.value} submitted />;
          case 'rejected':
            return (
              <SubmitPane
                state="error"
                backUrl={`/request?code=${requestForm.code}`}
                backUrlAs={`/request/${requestForm.code}`}
                error={requestSubmission.value}
              />
            );
          default:
            return '';
        }

      default:
        return null;
    }
  }
}
