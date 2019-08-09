import { action, observable, computed, autorun } from 'mobx';
import uuidv4 from 'uuid/v4';
import Router from 'next/router';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';
import { MemorableDateInput } from '@cityofboston/react-fleet';

import {
  BirthCertificateRequestInformation,
  BirthStep,
  JSONObject,
  JSONValue,
} from '../types';
import { CERTIFICATE_COST } from '../../lib/costs';
import UploadableFile, { UploadableFileRecord } from '../models/UploadableFile';

const BIRTH_CERTIFICATE_COST = CERTIFICATE_COST.BIRTH;

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
  idImageFront: null,
  idImageBack: null,
  supportingDocuments: [],
};

export const QUESTION_STEPS: BirthStep[] = [
  'forWhom',
  'bornInBoston',
  'personalInformation',
  'parentalInformation',
];

export const VERIFY_IDENTIFICATION_STEPS: BirthStep[] = [
  'verifyIdentification',
];

export const CHECKOUT_STEPS: BirthStep[] = [
  'reviewRequest',
  'shippingInformation',
  'billingInformation',
  'submitRequest',
];

/**
 * Type that has all the same keys as BirthCertificateRequestInformation but its
 * values are all JSON-serializable.
 */
type BirthCertificateRequestInformationJson = {
  [k in NonNullable<keyof BirthCertificateRequestInformation>]: JSONValue
};

const SESSION_STORAGE_KEY = 'birthCertificateRequest';

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
  requestInformation: BirthCertificateRequestInformation = INITIAL_REQUEST_INFORMATION;

  public uploadSessionId: string;
  public siteAnalytics: GaSiteAnalytics | null = null;

  private sessionStorageDisposer: Function | null = null;

  constructor() {
    this.uploadSessionId = uuidv4();
  }

  @action
  setSiteAnalytics(siteAnalytics: GaSiteAnalytics) {
    this.siteAnalytics = siteAnalytics;
  }

  @action
  setRequestInformation(
    requestInformation: BirthCertificateRequestInformation
  ): void {
    this.requestInformation = requestInformation;
  }

  /**
   * Converts the important parts of the request to JSON for sessionstorage
   * serialization.
   *
   * We explicitly don’t call this "toJSON" because we don’t want Jest’s
   * snapshot serializer to use it.
   */
  serializeToJSON(): JSONObject {
    const serializedRequestInformation: BirthCertificateRequestInformationJson = {
      altSpelling: this.requestInformation.altSpelling,
      birthDate: this.requestInformation.birthDate
        ? this.requestInformation.birthDate.toISOString()
        : null,
      bornInBoston: this.requestInformation.bornInBoston,
      firstName: this.requestInformation.firstName,
      forSelf: this.requestInformation.forSelf,
      howRelated: this.requestInformation.howRelated || null,
      lastName: this.requestInformation.lastName,
      parent1FirstName: this.requestInformation.parent1FirstName,
      parent1LastName: this.requestInformation.parent1LastName,
      parent2FirstName: this.requestInformation.parent2FirstName,
      parent2LastName: this.requestInformation.parent2LastName,
      parentsLivedInBoston:
        this.requestInformation.parentsLivedInBoston || null,
      parentsMarried: this.requestInformation.parentsMarried,
      idImageBack: this.requestInformation.idImageBack
        ? this.requestInformation.idImageBack.record
        : null,
      idImageFront: this.requestInformation.idImageFront
        ? this.requestInformation.idImageFront.record
        : null,
      supportingDocuments: this.requestInformation.supportingDocuments.map(
        f => f.record
      ),
    };

    return {
      quantity: this.quantity,
      uploadSessionId: this.uploadSessionId,
      requestInformation: serializedRequestInformation,
    };
  }

  /**
   * Inverse of #toJSON.
   */
  @action
  replaceWithJson(obj: any) {
    this.quantity = obj.quantity;
    this.uploadSessionId = obj.uploadSessionId;
    this.requestInformation = {
      altSpelling: obj.requestInformation.altSpelling,
      birthDate: obj.requestInformation.birthDate
        ? new Date(obj.requestInformation.birthDate)
        : null,
      bornInBoston: obj.requestInformation.bornInBoston,
      firstName: obj.requestInformation.firstName,
      forSelf: obj.requestInformation.forSelf,
      howRelated: obj.requestInformation.howRelated,
      idImageBack: obj.requestInformation.idImageBack
        ? UploadableFile.fromRecord(
            obj.requestInformation.idImageBack,
            this.uploadSessionId,
            'id back'
          )
        : null,
      idImageFront: obj.requestInformation.idImageFront
        ? UploadableFile.fromRecord(
            obj.requestInformation.idImageFront,
            this.uploadSessionId,
            'id front'
          )
        : null,
      lastName: obj.requestInformation.lastName,
      parent1FirstName: obj.requestInformation.parent1FirstName,
      parent1LastName: obj.requestInformation.parent1LastName,
      parent2FirstName: obj.requestInformation.parent2FirstName,
      parent2LastName: obj.requestInformation.parent2LastName,
      parentsLivedInBoston: obj.requestInformation.parentsLivedInBoston,
      parentsMarried: obj.requestInformation.parentsMarried,
      supportingDocuments: (
        obj.requestInformation.supportingDocuments || []
      ).map((r: UploadableFileRecord) =>
        UploadableFile.fromRecord(r, this.uploadSessionId)
      ),
    };
  }

  @action
  attach(sessionStorage: Storage | null) {
    if (sessionStorage) {
      const savedJson = sessionStorage.getItem(SESSION_STORAGE_KEY);

      if (savedJson) {
        try {
          const savedObj = JSON.parse(savedJson);
          this.replaceWithJson(savedObj);
        } catch (e) {
          // if there's a problem with the saved data then we want to wipe it out
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          if ((window as any).rollbar) {
            (window as any).rollbar.error(e);
          }
        }
      }

      this.sessionStorageDisposer = autorun(() => {
        sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify(this.serializeToJSON())
        );
      });
    }
  }

  detach() {
    if (this.sessionStorageDisposer) {
      this.sessionStorageDisposer();
      this.sessionStorageDisposer = null;
    }
  }

  @computed
  public get steps(): BirthStep[] {
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
    const { siteAnalytics } = this;
    const quantityChange = newQuantity - this.quantity;

    if (siteAnalytics) {
      siteAnalytics.addProduct(
        '0',
        'Birth certificate',
        'Birth certificate',
        Math.abs(quantityChange),
        BIRTH_CERTIFICATE_COST / 100
      );

      siteAnalytics.setProductAction(
        newQuantity > this.quantity ? 'add' : 'remove'
      );
    }

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

  // Returns an object that expresses whether or not each question step
  // is complete.
  @computed
  public get completedQuestionSteps() {
    const steps = {
      forWhom: false,
      personalInformation: false,
      parentalInformation: false,
      verifyIdentification: true,
    };

    const {
      forSelf,
      howRelated,
      firstName,
      lastName,
      bornInBoston,
      parentsLivedInBoston,
      parent1FirstName,
      parentsMarried,
      idImageFront,
    } = this.requestInformation;

    // forWhom
    if (forSelf || howRelated) {
      steps.forWhom = true;
    }

    // personalInformation
    if (firstName && lastName) {
      if (
        bornInBoston === 'yes' ||
        (parentsLivedInBoston === 'yes' || parentsLivedInBoston === 'unknown')
      ) {
        steps.personalInformation = true;
      }
    }

    // parentalInformation
    if (parent1FirstName && parentsMarried.length > 0) {
      steps.parentalInformation = true;
    }

    // verifyIdentification
    if (this.needsIdentityVerification) {
      steps.verifyIdentification = !!idImageFront;
    }

    return steps;
  }

  // Returns true if all question steps have been completed.
  @computed
  public get questionStepsComplete(): boolean {
    const steps = this.completedQuestionSteps;

    // Return false if any step is not complete.
    return !Object.keys(steps).find(key => !steps[key]);
  }

  @action
  public clearCertificateRequest(): void {
    this.quantity = 1;
    this.requestInformation = INITIAL_REQUEST_INFORMATION;
    this.uploadSessionId = uuidv4();

    Router.push('/birth');
  }

  @computed
  public get dateString(): string {
    const date = this.requestInformation.birthDate || null;

    if (date) {
      return MemorableDateInput.formattedDateUtc(date);
    } else {
      return '';
    }
  }

  @computed
  get fullName(): string {
    const { firstName, lastName } = this.requestInformation;

    return `${firstName} ${lastName}`;
  }

  /**
   * Use this to make a copy that you can modify without changing the global
   * BirthCertificateRequest.
   */
  @action
  public clone(): BirthCertificateRequest {
    const birthCertificateRequest = new BirthCertificateRequest();

    return Object.assign(birthCertificateRequest, this);
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
