// @flow

import { observable, computed, useStrict } from 'mobx';

import type { LoopbackGraphql } from '../graphql/loopback-graphql';
import type { Service, ServiceSummary } from '../types';
import type { SubmitRequestMutationVariables, SubmitRequestMutation } from '../graphql/schema.flow';
import SubmitRequestGraphql from '../graphql/SubmitRequest.graphql';

import Question from './Question';

useStrict(true);

class ContactInfo {
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
  serviceCache: {[code: string]: Service} = observable.shallowMap({});

  apiKeys: {[service: string]: string} = {};

  @observable.ref _currentService: ?Service = null;

  @computed get currentService(): ?Service {
    return this._currentService;
  }

  set currentService(service: ?Service) {
    if (service === this._currentService) {
      return;
    }

    this._currentService = service;
    if (service) {
      this.contactInfo.required = service.contactRequired;
      this.locationInfo.required = service.locationRequired;
      this.questions = Question.buildQuestions(service.attributes);
    }
  }

  @computed
  get questionRequirementsMet(): boolean {
    return this.questions.filter((q) => !q.required || !q.visible || q.requirementsMet).length === this.questions.length;
  }

  submitRequest = async (loopbackGraphql: LoopbackGraphql): Promise<SubmitRequestMutation> => {
    const { currentService, questions } = this;

    if (!currentService) {
      throw new Error('service not currently set in store');
    }

    const attributes = [];

    questions.forEach(({ code, validatedValue }) => {
      // null takes into account question visibility
      if (validatedValue == null) {
        return;
      }

      if (Array.isArray(validatedValue)) {
        validatedValue.forEach((v) => { attributes.push({ code, value: v }); });
      } else {
        attributes.push({ code, value: validatedValue });
      }
    });

    const vars: SubmitRequestMutationVariables = {
      code: currentService.code,
      description: this.description,
      firstName: this.contactInfo.firstName,
      lastName: this.contactInfo.lastName,
      email: this.contactInfo.email,
      phone: this.contactInfo.phone,
      location: this.locationInfo.location,
      address: this.locationInfo.address,
      attributes,
    };

    return loopbackGraphql(SubmitRequestGraphql, vars);
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
