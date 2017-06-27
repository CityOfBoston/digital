// @flow

import { observable, computed } from 'mobx';

import type { Service } from '../types';
import Question from './Question';

// Class to encapsulate the request that's being built up over the course of
// the web flow.
export default class RequestForm {
  _service: ?Service;

  @computed
  get code(): string {
    return this._service ? this._service.code : '';
  }

  @observable description: string = '';
  @observable mediaUrl: string = '';

  @observable address: string = '';
  @observable.shallow location: ?{| lat: number, lng: number |} = null;
  @observable addressId: ?string = null;
  @observable sendLocation: boolean = false;

  @observable firstName: string = '';
  @observable lastName: string = '';
  @observable email: string = '';
  @observable phone: string = '';
  @observable sendContactInfo: boolean = false;

  @observable questions: Question[] = [];

  @computed
  get showContactInfoForm(): boolean {
    return !!this._service && this._service.contactRequirement !== 'HIDDEN';
  }

  @computed
  get contactInfoRequired(): boolean {
    return !!this._service && this._service.contactRequirement === 'REQUIRED';
  }

  // can be false even when required is false to differentiate between submitting
  // and skipping
  @computed
  get contactInfoRequirementsMet(): boolean {
    return !!(this.firstName && this.lastName && this.email);
  }

  @computed
  get showLocationPicker(): boolean {
    return !!this._service && this._service.locationRequirement !== 'HIDDEN';
  }

  @computed
  get locationRequired(): boolean {
    return !!this._service && this._service.locationRequirement === 'REQUIRED';
  }

  @computed
  get locationRequirementsMet(): boolean {
    return this.address.length > 0;
  }

  @computed
  get questionRequirementsMet(): boolean {
    return (
      this.questions.filter(q => !q.required || !q.visible || q.requirementsMet)
        .length === this.questions.length
    );
  }

  constructor(service: ?Service) {
    this._service = service;
    if (service) {
      this.questions = Question.buildQuestions(service.attributes);
    } else {
      this.questions = [];
    }
  }
}
