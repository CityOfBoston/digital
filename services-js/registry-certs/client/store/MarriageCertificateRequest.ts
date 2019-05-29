import { action, observable, computed, autorun } from 'mobx';
import uuidv4 from 'uuid/v4';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';
import { MemorableDateInput } from '@cityofboston/react-fleet';

// import UploadableFile, { UploadableFileRecord } from '../models/UploadableFile';

import {
  MarriageCertificateRequestInformation,
  MarriageStep,
  JSONObject,
  // JSONValue,
} from '../types';
import { CERTIFICATE_COST } from '../../lib/costs';

const MARRIAGE_CERTIFICATE_COST = CERTIFICATE_COST.MARRIAGE;

// This is used for initial state during the questions flow, and to
// reset all fields if user selects “start over”
export const INITIAL_REQUEST_INFORMATION: Readonly<
  MarriageCertificateRequestInformation
> = {
  forSelf: null,
  howRelated: '',
  filedInBoston: '',
  dateOfMarriage: null,
  firstName1: '',
  firstName2: '',
  lastName1: '',
  lastName2: '',
  maidenName1: '',
  maidenName2: '',
  parentsMarried1: '',
  parentsMarried2: '',
  idImageFront: null,
  idImageBack: null,
  supportingDocuments: [],
};

export const QUESTION_STEPS: MarriageStep[] = [
  'forWhom',
  'filedInBoston',
  'dateOfMarriage',
  'namesOnRecord',
  'parentalInformation',
];

export const VERIFY_IDENTIFICATION_STEPS: MarriageStep[] = [
  'verifyIdentification',
];

export const CHECKOUT_STEPS: MarriageStep[] = [
  'reviewRequest',
  'shippingInformation',
  'billingInformation',
  'submitRequest',
];

/**
 * Type that has all the same keys as MarriageCertificateRequestInformation but its
 * values are all JSON-serializable.
 */
// type MarriageCertificateRequestInformationJson = {
//   [k in NonNullable<keyof MarriageCertificateRequestInformation>]: JSONValue
// };

const SESSION_STORAGE_KEY = 'marriageCertificateRequest';

/**
 * State object for a marriage certificate request.
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
export default class MarriageCertificateRequest {
  @observable quantity: number = 1;

  @observable
  requestInformation: MarriageCertificateRequestInformation = INITIAL_REQUEST_INFORMATION;

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
    requestInformation: MarriageCertificateRequestInformation
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
    // const serializedRequestInformation: MarriageCertificateRequestInformation = {
    //   altSpelling: this.requestInformation.altSpelling,
    //   birthDate: this.requestInformation.birthDate
    //     ? this.requestInformation.birthDate.toISOString()
    //     : null,
    //   bornInBoston: this.requestInformation.bornInBoston,
    //   firstName: this.requestInformation.firstName,
    //   forSelf: this.requestInformation.forSelf,
    //   howRelated: this.requestInformation.howRelated || null,
    //   lastName: this.requestInformation.lastName,
    //   parent1FirstName: this.requestInformation.parent1FirstName,
    //   parent1LastName: this.requestInformation.parent1LastName,
    //   parent2FirstName: this.requestInformation.parent2FirstName,
    //   parent2LastName: this.requestInformation.parent2LastName,
    //   parentsLivedInBoston:
    //     this.requestInformation.parentsLivedInBoston || null,
    //   parentsMarried: this.requestInformation.parentsMarried,
    //   idImageBack: this.requestInformation.idImageBack
    //     ? this.requestInformation.idImageBack.record
    //     : null,
    //   idImageFront: this.requestInformation.idImageFront
    //     ? this.requestInformation.idImageFront.record
    //     : null,
    //   supportingDocuments: this.requestInformation.supportingDocuments.map(
    //     f => f.record
    //   ),
    // };

    return {
      quantity: this.quantity,
      uploadSessionId: this.uploadSessionId,
      // requestInformation: serializedRequestInformation,
    };
  }

  /**
   * Inverse of #toJSON.
   */
  @action
  replaceWithJson(obj: any) {
    this.quantity = obj.quantity;
    this.uploadSessionId = obj.uploadSessionId;
    // this.requestInformation = {
    //   altSpelling: obj.requestInformation.altSpelling,
    //   birthDate: obj.requestInformation.birthDate
    //     ? new Date(obj.requestInformation.birthDate)
    //     : null,
    //   bornInBoston: obj.requestInformation.bornInBoston,
    //   firstName: obj.requestInformation.firstName,
    //   forSelf: obj.requestInformation.forSelf,
    //   howRelated: obj.requestInformation.howRelated,
    //   idImageBack: obj.requestInformation.idImageBack
    //     ? UploadableFile.fromRecord(
    //         obj.requestInformation.idImageBack,
    //         this.uploadSessionId,
    //         'id back'
    //       )
    //     : null,
    //   idImageFront: obj.requestInformation.idImageFront
    //     ? UploadableFile.fromRecord(
    //         obj.requestInformation.idImageFront,
    //         this.uploadSessionId,
    //         'id front'
    //       )
    //     : null,
    //   lastName: obj.requestInformation.lastName,
    //   parent1FirstName: obj.requestInformation.parent1FirstName,
    //   parent1LastName: obj.requestInformation.parent1LastName,
    //   parent2FirstName: obj.requestInformation.parent2FirstName,
    //   parent2LastName: obj.requestInformation.parent2LastName,
    //   parentsLivedInBoston: obj.requestInformation.parentsLivedInBoston,
    //   parentsMarried: obj.requestInformation.parentsMarried,
    //   supportingDocuments: (
    //     obj.requestInformation.supportingDocuments || []
    //   ).map((r: UploadableFileRecord) =>
    //     UploadableFile.fromRecord(r, this.uploadSessionId)
    //   ),
    // };
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
          // if there’s a problem with the saved data then we want to wipe it out
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
  public get steps(): MarriageStep[] {
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
    const { parentsMarried1, parentsMarried2 } = this.requestInformation;

    return (
      (parentsMarried1.length > 0 && parentsMarried1 !== 'yes') ||
      (parentsMarried2.length > 0 && parentsMarried2 !== 'yes')
    );
  }

  @action
  public setQuantity(newQuantity: number): void {
    const { siteAnalytics } = this;
    const quantityChange = newQuantity - this.quantity;

    if (siteAnalytics) {
      siteAnalytics.addProduct(
        '0',
        'Marriage certificate',
        'Marriage certificate',
        Math.abs(quantityChange),
        MARRIAGE_CERTIFICATE_COST / 100
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
    answers: Partial<MarriageCertificateRequestInformation>
  ): void {
    this.requestInformation = {
      ...this.requestInformation,
      ...answers,
    };
  }

  /**
   * Returns an object that expresses whether or not each question step
   * is complete.
   */
  @computed
  public get completedQuestionSteps() {
    const steps = {
      forWhom: false,
      dateOfMarriage: false,
      namesOnRecord: false,
      parentalInformation: false,
      verifyIdentification: true,
    };

    const {
      forSelf,
      howRelated,
      filedInBoston,
      dateOfMarriage,
      firstName1,
      firstName2,
      lastName1,
      lastName2,
      parentsMarried1,
      parentsMarried2,
      idImageFront,
    } = this.requestInformation;

    // forWhom
    if (forSelf || howRelated) {
      steps.forWhom = true;
    }

    // namesOnRecord
    if (firstName1 && lastName1 && firstName2 && lastName2) {
      if (filedInBoston === 'yes') {
        steps.namesOnRecord = true;
      }
    }

    // dateOfMarriage
    if (dateOfMarriage) {
      steps.dateOfMarriage = true;
    }

    // parentalInformation
    if (parentsMarried1.length > 0 && parentsMarried2.length > 0) {
      steps.parentalInformation = true;
    }

    // verifyIdentification
    if (this.needsIdentityVerification) {
      steps.verifyIdentification = !!idImageFront;
    }

    return steps;
  }

  /**
   * Returns true if all question steps have been completed.
   */
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
  }

  @computed
  public get dateString(): string {
    const date = this.requestInformation.dateOfMarriage || null;

    if (date) {
      return MemorableDateInput.formattedDateUtc(date);
    } else {
      return '';
    }
  }

  formatFullName(whom: 'person1' | 'person2'): string {
    let firstName, lastName, maidenName;

    if (whom === 'person1') {
      firstName = this.requestInformation.firstName1;
      lastName = this.requestInformation.lastName1;
      maidenName = this.requestInformation.maidenName1;
    } else {
      firstName = this.requestInformation.firstName2;
      lastName = this.requestInformation.lastName2;
      maidenName = this.requestInformation.maidenName2;
    }

    return `${firstName} ${maidenName ? `(${maidenName}) ` : ''}${lastName}`;
  }

  @computed
  get fullName1(): string {
    return this.formatFullName('person1');
  }

  @computed
  get fullName2(): string {
    return this.formatFullName('person2');
  }

  /**
   * Use this to make a copy that you can modify without changing the global
   * MarriageCertificateRequest.
   */
  @action
  public clone(): MarriageCertificateRequest {
    const marriageCertificateRequest = new MarriageCertificateRequest();

    return Object.assign(marriageCertificateRequest, this);
  }

  /**
   * Use this to move any changes from a local MarriageCertificateRequest,
   * created with clone(), to the global MarriageCertificateRequest.
   */
  @action
  public updateFrom(req: MarriageCertificateRequest) {
    Object.assign(this, req);
  }

  /**
   * True if the user answers that the marriage was NOT filed in the
   * City of Boston.
   */
  @computed
  public get definitelyDontHaveRecord(): boolean {
    return this.requestInformation.filedInBoston === 'no';
  }

  /**
   * True if we might not have the marriage certificate based on the user’s
   * answer to whether the marriage was filed in the City of Boston.
   */
  @computed
  public get mightNotHaveRecord(): boolean {
    return this.requestInformation.filedInBoston === 'unknown';
  }

  /**
   * Unless user has specified that both sets of parents were married at the
   * time of each person’s birth, we must inform the user that the record
   * may be restricted.
   */
  @computed
  public get mayBeRestricted(): boolean {
    const { parentsMarried1, parentsMarried2 } = this.requestInformation;

    return (
      (parentsMarried1.length > 0 && parentsMarried1 !== 'yes') ||
      (parentsMarried2.length > 0 && parentsMarried2 !== 'yes')
    );
  }
}
