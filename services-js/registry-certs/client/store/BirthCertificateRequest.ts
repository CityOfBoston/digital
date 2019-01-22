import { action, observable } from 'mobx';

import { BirthCertificateRequestInformation, Step } from '../types';

// This is used for initial state during the questions flow, and to
// reset all fields if user selects “start over”
export const initialRequestInformation: BirthCertificateRequestInformation = {
  forSelf: null,
  howRelated: '',
  bornInBoston: '',
  parentsLivedInBoston: '',
  firstName: '',
  lastName: '',
  altSpelling: '',
  birthDate: '',
  parentsMarried: '',
  parent1FirstName: '',
  parent1LastName: '',
  parent2FirstName: '',
  parent2LastName: '',
};

/**
 * State object for a birth certificate request.
 *
 * quantity: number of certificates requested
 * currentStep: name of the current step in the overall request flow
 * currentStepCompleted: whether or not the currentStep has been completed (for
 * progress bar display/user feedback)
 * requestInformation: information needed by the Registry to find the record
 */
export default class BirthCertificateRequest {
  @observable quantity: number = 1;
  @observable currentStep: Step = 'forWhom';
  @observable currentStepCompleted: boolean = false;
  @observable
  requestInformation: BirthCertificateRequestInformation = initialRequestInformation;

  @action
  public setQuantity(newQuantity: number): void {
    this.quantity = newQuantity;
  }

  @action
  public setCurrentStep = (step: Step): void => {
    this.currentStep = step;

    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  @action
  public setCurrentStepCompleted = (isCompleted: boolean): void => {
    this.currentStepCompleted = isCompleted;
  };

  // A user’s answer may span several fields:
  @action
  public answerQuestion = (answers: object): void => {
    this.requestInformation = {
      ...this.requestInformation,
      ...answers,
    };
  };

  @action
  public clearBirthCertificateRequest(): void {
    this.quantity = 0;
    this.currentStep = 'forWhom';
    this.requestInformation = initialRequestInformation;
  }
}
