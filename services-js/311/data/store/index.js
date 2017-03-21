// @flow

import { observable, computed, useStrict } from 'mobx';
import type { IPromiseBasedObservable } from 'mobx-utils';

import type { Service, ServiceSummary, SubmittedRequest } from '../types';
import Question from './Question';

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

  @observable.shallow serviceSummaries: ServiceSummary[];
  serviceCache: Map<string, Service> = observable.shallowMap({});

  apiKeys: {[service: string]: string} = {};
  isPhone: boolean = false;

  @observable requestSubmission: ?IPromiseBasedObservable<SubmittedRequest> = null;

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
  }

  return store;
}
