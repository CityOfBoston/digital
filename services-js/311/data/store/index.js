// @flow
/* global window */
/* eslint no-underscore-dangle: 0 */

import { observable, computed, useStrict, action } from 'mobx';
import type { IPromiseBasedObservable } from 'mobx-utils';

import type { Service, ServiceSummary, SubmittedRequest } from '../types';

import RequestSearch from './RequestSearch';
import Question from './Question';
import Ui from './Ui';

// MobX will enforce that state changes only happen in action blocks.
useStrict(true);

export class ContactInfo {
  @observable required: boolean = false;
  @observable firstName: string = '';
  @observable lastName: string = '';
  @observable email: string = '';
  @observable phone: string = '';

  // can be false even when required is false to differentiate between submitting
  // and skipping
  @computed
  get requirementsMet(): boolean {
    return !!(this.firstName && this.lastName);
  }
}

export class LocationInfo {
  @observable required: boolean = false;
  @observable address: string = '';
  @observable.shallow location: ?{| lat: number, lng: number |} = null;

  // can be false even when required is false to differentiate between submitting
  // and skipping
  @computed
  get requirementsMet(): boolean {
    return this.address.length > 0;
  }
}

export class AppStore {
  @observable description: string = '';

  @observable contactInfo: ContactInfo = new ContactInfo();
  @observable locationInfo: LocationInfo = new LocationInfo();
  @observable questions: Question[] = [];

  requestSearch: RequestSearch = new RequestSearch();
  ui: Ui = new Ui();

  @observable.shallow serviceSummaries: ServiceSummary[];
  serviceCache: Map<string, Service> = observable.shallowMap({});

  @observable liveAgentAvailable: boolean = (typeof window !== 'undefined' && window.LIVE_AGENT_AVAILABLE) || false;

  // Initialization data from the server
  apiKeys: {[service: string]: string} = {};
  isPhone: boolean = false;

  @observable requestSubmission: ?IPromiseBasedObservable<SubmittedRequest> = null;

  _liveAgentButtonId: string = '';

  get liveAgentButtonId(): string {
    return this._liveAgentButtonId;
  }

  set liveAgentButtonId(liveAgentButtonId: string) {
    this._liveAgentButtonId = liveAgentButtonId;

    if (typeof window !== 'undefined') {
      if (window.liveagent) {
        this.listenForLiveAgentEvents(liveAgentButtonId);
      } else {
        if (!window._laq) {
          window._laq = [];
        }

        window._laq.push(() => this.listenForLiveAgentEvents(liveAgentButtonId));
      }
    }
  }

  listenForLiveAgentEvents(liveAgentButtonId: string) {
    window.liveagent.addButtonEventHandler(liveAgentButtonId, this.liveAgentEventHandler);
  }

  @action.bound
  liveAgentEventHandler(event: string) {
    switch (event) {
      case 'BUTTON_AVAILABLE': this.liveAgentAvailable = true; break;
      case 'BUTTON_UNAVAILABLE': this.liveAgentAvailable = false; break;
      default: break;
    }
  }

  @observable.ref _currentService: ?Service = null;
  @observable.ref currentServiceError: ?Object = null;

  @computed get currentService(): ?Service {
    return this._currentService;
  }

  set currentService(service: ?Service) {
    if (service === this._currentService) {
      return;
    }

    this._currentService = service;
    this.currentServiceError = null;
    this.questions = [];

    if (service) {
      try {
        this.contactInfo.required = service.contactRequired;
        this.locationInfo.required = service.locationRequired;
        this.questions = Question.buildQuestions(service.attributes);
      } catch (e) {
        this.currentServiceError = e;
      }
    }
  }

  @computed
  get questionRequirementsMet(): boolean {
    return this.questions.filter((q) => !q.required || !q.visible || q.requirementsMet).length === this.questions.length;
  }
}

let browserStore: AppStore;

/**
 * Returns a Redux store for this application. For the server, always returns a
 * fresh store with the given initialState. On the browser, will always return
 * the same store and initialState is ignored after the first call.
 */
export default function getStore(): AppStore {
  if (process.browser && browserStore) {
    return browserStore;
  }

  const store = new AppStore();

  if (process.browser) {
    browserStore = store;
    store.ui.attach();
  }

  return store;
}
