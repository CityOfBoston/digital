import { observable, computed } from 'mobx';

import { Service } from '../types';
import Question from './Question';

// Class to encapsulate the request that's being built up over the course of
// the web flow.
export default class RequestForm {
  private readonly service: Service | null;

  @computed
  get code(): string {
    return this.service ? this.service.code : '';
  }

  // This is the description originally typed into the home page. We keep track
  // of it to help train the classifier.
  descriptionForClassifier: string = '';
  @observable description: string = '';
  @observable mediaUrl: string = '';

  @observable address: string = '';
  @observable.shallow location: { lat: number; lng: number } | null = null;
  @observable addressId: string | null = null;
  @observable addressIntent: 'ADDRESS' | 'LATLNG' = 'ADDRESS';
  @observable sendLocation: boolean = false;
  @observable locationRequirementsMet: boolean = false;

  @observable firstName: string = '';
  @observable lastName: string = '';
  @observable email: string = '';
  @observable phone: string = '';
  @observable sendContactInfo: boolean = false;

  @observable questions: Question[] = [];

  @computed
  get showContactInfoForm(): boolean {
    return !!this.service && this.service.contactRequirement !== 'HIDDEN';
  }

  @computed
  get contactInfoRequired(): boolean {
    return !!this.service && this.service.contactRequirement === 'REQUIRED';
  }

  // can be false even when required is false to differentiate between submitting
  // and skipping
  @computed
  get contactInfoRequirementsMet(): boolean {
    return !!(this.firstName && this.lastName && this.email);
  }

  @computed
  get showLocationPicker(): boolean {
    return !!this.service && this.service.locationRequirement !== 'HIDDEN';
  }

  @computed
  get locationRequired(): boolean {
    return !!this.service && this.service.locationRequirement === 'REQUIRED';
  }

  @computed
  get questionRequirementsMet(): boolean {
    return (
      this.questions.filter(q => !q.required || !q.visible || q.requirementsMet)
        .length === this.questions.length
    );
  }

  constructor(service: Service | null = null) {
    this.service = service;
    if (service) {
      this.questions = Question.buildQuestions(service.attributes);
    } else {
      this.questions = [];
    }
  }
}
