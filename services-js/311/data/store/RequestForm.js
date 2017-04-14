// @flow

import { observable, computed, action } from 'mobx';

import type { Service } from '../types';
import Question from './Question';

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
    return !!(this.firstName && this.lastName && this.email);
  }
}

export class LocationInfo {
  @observable required: boolean = false;
  @observable address: string = '';
  @observable.shallow location: ?{ lat: number, lng: number } = null;

  // can be false even when required is false to differentiate between submitting
  // and skipping
  @computed
  get requirementsMet(): boolean {
    return this.address.length > 0;
  }
}

// Class to encapsulate the request that's being built up over the course of
// the web flow.
export default class RequestForm {
  @observable description: string = '';
  @observable mediaUrl: string = ''

  @observable contactInfo: ContactInfo = new ContactInfo();
  @observable locationInfo: LocationInfo = new LocationInfo();
  @observable questions: Question[] = [];

  @action
  updateForService(service: ?Service) {
    this.questions = [];

    if (service) {
      this.contactInfo.required = service.contactRequired;
      this.locationInfo.required = service.locationRequired;
      this.questions = Question.buildQuestions(service.attributes);
    }
  }

  @computed get questionRequirementsMet(): boolean {
    return this.questions.filter((q) => !q.required || !q.visible || q.requirementsMet).length === this.questions.length;
  }
}
