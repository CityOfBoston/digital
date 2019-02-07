import { action, observable, computed } from 'mobx';

import { BirthCertificateRequestInformation, Step } from '../types';

// This is used for initial state during the questions flow, and to
// reset all fields if user selects “start over”
export const INITIAL_REQUEST_INFORMATION: Readonly<
  BirthCertificateRequestInformation
> = {
  forSelf: null,
  howRelated: '',
  bornInBoston: '',
  parentsLivedInBoston: '',
  firstName: '',
  lastName: '',
  altSpelling: '',
  birthDate: null,
  parentsMarried: '',
  parent1FirstName: '',
  parent1LastName: '',
  parent2FirstName: '',
  parent2LastName: '',
};

export const QUESTION_STEPS: Step[] = [
  'forWhom',
  'bornInBoston',
  'personalInformation',
  'parentalInformation',
];

export const VERIFY_IDENTIFICATION_STEPS: Step[] = ['verifyIdentification'];

export const CHECKOUT_STEPS: Step[] = [
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

  @observable
  requestInformation: Readonly<
    BirthCertificateRequestInformation
  > = INITIAL_REQUEST_INFORMATION;

  @computed
  public get steps(): Step[] {
    const { forSelf, howRelated } = this.requestInformation;

    if (!forSelf && howRelated === 'client') {
      return ['forWhom', 'clientInstructions'];
    } else {
      return [
        ...QUESTION_STEPS,
        ...(this.needsIdentityVerification ? VERIFY_IDENTIFICATION_STEPS : []),
        ...CHECKOUT_STEPS,
      ];
    }
  }

  @computed
  public get needsIdentityVerification(): boolean {
    const { parentsMarried } = this.requestInformation;
    return !!(parentsMarried && parentsMarried !== 'yes');
  }

  @action
  public setQuantity(newQuantity: number): void {
    this.quantity = newQuantity;
  }

  // A user’s answer may span several fields:
  @action
  public answerQuestion(
    answers: Partial<BirthCertificateRequestInformation>
  ): void {
    this.requestInformation = {
      ...this.requestInformation,
      ...answers,
    };
  }

  @action
  public clearBirthCertificateRequest(): void {
    this.quantity = 0;
    this.requestInformation = INITIAL_REQUEST_INFORMATION;
  }

  @computed
  public get birthDateString(): string {
    const date = this.requestInformation.birthDate || null;

    if (date) {
      return Intl.DateTimeFormat('en-US').format(date);
    } else {
      return '';
    }
  }

  /**
   * Use this to make a copy that you can modify without changing the global
   * BirthCertificateRequest.
   */
  public clone(): BirthCertificateRequest {
    return Object.assign(new BirthCertificateRequest(), this);
  }

  /**
   * Use this to move any changes from a local BirthCertificateRequest, created
   * with clone(), to the global BirthCertificateRequest.
   */
  @action
  public updateFrom(req: BirthCertificateRequest) {
    Object.assign(this, req);
  }

  /**
   * True if, based on the user’s answers to whether or not they were born in
   * Boston and whether or not their parents lived in Boston, we don’t have the
   * birth certificate.
   */
  @computed
  public get definitelyDontHaveRecord(): boolean {
    const { bornInBoston, parentsLivedInBoston } = this.requestInformation;

    return bornInBoston === 'no' && parentsLivedInBoston === 'no';
  }

  /**
   * True if we might not have the birth certificate based on the user’s answers
   * to whether they were born in Boston and whether their parents lived here.
   *
   * Will always return false if definitelyDontHaveRecord returns true.
   */
  @computed
  public get mightNotHaveRecord(): boolean {
    const { bornInBoston, parentsLivedInBoston } = this.requestInformation;

    return (
      !!(
        bornInBoston !== '' &&
        bornInBoston !== 'yes' &&
        parentsLivedInBoston !== '' &&
        parentsLivedInBoston !== 'yes'
      ) && !this.definitelyDontHaveRecord
    );
  }

  // Unless user has specified that the parents were married at the time of
  // birth, we must inform the user that the record may be restricted.
  @computed
  public get mayBeRestricted(): boolean {
    const { parentsMarried } = this.requestInformation;
    return parentsMarried === 'no' || parentsMarried === 'unknown';
  }
}
