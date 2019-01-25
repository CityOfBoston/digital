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

const initialSteps: Step[] = [
  'forWhom',
  'bornInBoston',
  'personalInformation',
  'parentalInformation',
  'reviewRequest',
  'shippingInformation',
  'billingInformation',
  'submitRequest',
];

/**
 * State object for a birth certificate request.
 *
 * quantity: Number of certificates requested
 *
 * steps: All steps in request flow. If a record is (probably) restricted,
 * 'verifyInformation' must be added after 'parentalInformation'.
 *
 * currentStep: Name of the current step in the overall request flow
 *
 * currentStepCompleted: Whether or not the currentStep has been completed (for
 * progress bar display/user feedback)

 * requestInformation: Information needed by the Registry to find the record
 */
export default class BirthCertificateRequest {
  @observable quantity: number = 1;
  @observable steps: Step[] = initialSteps;
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

  @action
  public addVerificationStep = (): void => {
    const targetIndex = this.steps.indexOf('parentalInformation') + 1;

    // Normally would avoid mutation, but if we replace the variable with a
    // new array, the progress bar loses its steps information.
    if (!this.steps.includes('verifyIdentification')) {
      this.steps.splice(targetIndex, 0, 'verifyIdentification');
    }
  };

  @action
  public removeVerificationStep = (): void => {
    const targetIndex = this.steps.indexOf('verifyIdentification');

    // See comment directly above ^^
    if (this.steps.includes('verifyIdentification')) {
      this.steps.splice(targetIndex, 1);
    }
  };

  @action
  public verificationStepRequired = (mustVerify: boolean): void => {
    mustVerify ? this.addVerificationStep() : this.removeVerificationStep();
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
    this.steps = initialSteps;
    this.currentStep = 'forWhom';
    this.requestInformation = initialRequestInformation;
  }
}
