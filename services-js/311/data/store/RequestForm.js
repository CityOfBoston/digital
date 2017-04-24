// @flow

import { observable, computed, action, autorunAsync } from 'mobx';

import type { Service } from '../types';
import Question from './Question';

export class ContactInfo {
  @observable ask: boolean = true;
  @observable required: boolean = false;
  @observable firstName: string = '';
  @observable lastName: string = '';
  @observable email: string = '';
  @observable phone: string = '';

  @observable rememberInfo: boolean = false;

  constructor() {
    if (this.canRememberInfo) {
      this.rememberInfo = localStorage.getItem('ContactInfo.firstName') != null;
      this.firstName = localStorage.getItem('ContactInfo.firstName') || '';
      this.lastName = localStorage.getItem('ContactInfo.lastName') || '';
      this.email = localStorage.getItem('ContactInfo.email') || '';
      this.phone = localStorage.getItem('ContactInfo.phone') || '';

      autorunAsync('remember contact info', () => {
        if (this.rememberInfo) {
          localStorage.setItem('ContactInfo.firstName', this.firstName);
          localStorage.setItem('ContactInfo.lastName', this.lastName);
          localStorage.setItem('ContactInfo.email', this.email);
          localStorage.setItem('ContactInfo.phone', this.phone);
        } else {
          localStorage.removeItem('ContactInfo.firstName');
          localStorage.removeItem('ContactInfo.lastName');
          localStorage.removeItem('ContactInfo.email');
          localStorage.removeItem('ContactInfo.phone');
        }
      }, 250);
    }
  }

  // can be false even when required is false to differentiate between submitting
  // and skipping
  @computed
  get requirementsMet(): boolean {
    return !!(this.firstName && this.lastName && this.email);
  }

  @computed get canRememberInfo(): boolean {
    return typeof localStorage !== 'undefined';
  }
}

export class LocationInfo {
  @observable ask: boolean = true;
  @observable required: boolean = false;
  @observable address: string = '';
  @observable.shallow location: ?{ lat: number, lng: number } = null;

  // can be false even when required is false to differentiate between submitting
  // and skipping
  @computed get requirementsMet(): boolean {
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
      this.contactInfo.required = service.contactRequirement === 'REQUIRED';
      this.contactInfo.ask = service.contactRequirement !== 'HIDDEN';

      this.locationInfo.required = service.locationRequirement === 'REQUIRED';
      this.contactInfo.ask = service.contactRequirement !== 'HIDDEN';

      this.questions = Question.buildQuestions(service.attributes);
    }
  }

  @computed get questionRequirementsMet(): boolean {
    return this.questions.filter((q) => !q.required || !q.visible || q.requirementsMet).length === this.questions.length;
  }
}
