import { action, observable, computed, autorun } from 'mobx';
import uuidv4 from 'uuid/v4';
import Router from 'next/router';

import { MemorableDateInput } from '@cityofboston/react-fleet';

import UploadableFile, { UploadableFileRecord } from '../models/UploadableFile';

import {
  MarriageCertificateRequestInformation,
  MarriageStep,
  JSONObject,
  JSONValue,
} from '../types';

// This is used for initial state during the questions flow, and to
// reset all fields if user selects “start over”
export const INITIAL_REQUEST_INFORMATION: Readonly<
  MarriageCertificateRequestInformation
> = {
  forSelf: null,
  howRelated: '',
  filedInBoston: '',
  dateOfMarriageExact: null,
  dateOfMarriageUnsure: '',
  fullName1: '',
  fullName2: '',
  maidenName1: '',
  maidenName2: '',
  parentsMarried1: '',
  parentsMarried2: '',
  altSpellings1: '',
  altSpellings2: '',
  customerNotes: '',
  idImageFront: null,
  idImageBack: null,
  supportingDocuments: [],
};

export const QUESTION_STEPS: MarriageStep[] = [
  'forWhom',
  'filedInBoston',
  'dateOfMarriage',
  'personOnRecord1',
  'personOnRecord2',
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
type MarriageCertificateRequestInformationJson = {
  [k in NonNullable<keyof MarriageCertificateRequestInformation>]: JSONValue
};

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
  private sessionStorageDisposer: Function | null = null;

  constructor() {
    this.uploadSessionId = uuidv4();
  }

  @action
  setRequestInformation(
    requestInformation: MarriageCertificateRequestInformation
  ): void {
    this.requestInformation = requestInformation;
  }

  /**
   * Converts the important parts of the request to JSON for sessionStorage
   * serialization.
   *
   * We explicitly don’t call this “toJSON” because we don’t want Jest’s
   * snapshot serializer to use it.
   */
  serializeToJSON(): JSONObject {
    const serializedRequestInformation: MarriageCertificateRequestInformationJson = {
      forSelf: this.requestInformation.forSelf,
      howRelated: this.requestInformation.howRelated || null,
      filedInBoston: this.requestInformation.filedInBoston,
      fullName1: this.requestInformation.fullName1,
      fullName2: this.requestInformation.fullName2,
      maidenName1: this.requestInformation.maidenName1 || '',
      maidenName2: this.requestInformation.maidenName2 || '',
      altSpellings1: this.requestInformation.altSpellings1 || null,
      altSpellings2: this.requestInformation.altSpellings2 || null,
      parentsMarried1: this.requestInformation.parentsMarried1,
      parentsMarried2: this.requestInformation.parentsMarried2,
      dateOfMarriageExact: this.requestInformation.dateOfMarriageExact
        ? this.requestInformation.dateOfMarriageExact.toISOString()
        : null,
      dateOfMarriageUnsure: this.requestInformation.dateOfMarriageUnsure || '',
      customerNotes: this.requestInformation.customerNotes || '',

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
      forSelf: obj.requestInformation.forSelf,
      howRelated: obj.requestInformation.howRelated,
      filedInBoston: obj.requestInformation.filedInBoston,
      dateOfMarriageExact: obj.requestInformation.dateOfMarriageExact
        ? new Date(obj.requestInformation.dateOfMarriageExact)
        : null,
      dateOfMarriageUnsure: obj.requestInformation.dateOfMarriageUnsure,
      fullName1: obj.requestInformation.fullName1,
      fullName2: obj.requestInformation.fullName2,
      maidenName1: obj.requestInformation.maidenName1,
      maidenName2: obj.requestInformation.maidenName2,
      altSpellings1: obj.requestInformation.altSpellings1,
      altSpellings2: obj.requestInformation.altSpellings2,
      parentsMarried1: obj.requestInformation.parentsMarried1,
      parentsMarried2: obj.requestInformation.parentsMarried2,

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
    return this.mayBeRestricted;
  }

  @action
  public setQuantity(newQuantity: number): void {
    this.quantity = newQuantity;
  }

  // A user’s answer may span several fields:
  @action
  public answerQuestion(
    answers: Partial<MarriageCertificateRequestInformation>
  ): void {
    const { requestInformation } = this;

    this.requestInformation = {
      ...requestInformation,
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
      filedInBoston: false,
      dateOfMarriage: false,
      personOnRecord1: false,
      personOnRecord2: false,
      verifyIdentification: true,
    };

    const {
      forSelf,
      filedInBoston,
      dateOfMarriageExact,
      dateOfMarriageUnsure,
      fullName1,
      fullName2,
      parentsMarried1,
      parentsMarried2,
      idImageFront,
    } = this.requestInformation;

    // forWhom
    if (forSelf !== null) {
      steps.forWhom = true;
    }

    // filedInBoston
    if (filedInBoston.length > 0) {
      steps.filedInBoston = true;
    }

    // dateOfMarriage
    if (
      dateOfMarriageExact ||
      (dateOfMarriageUnsure && dateOfMarriageUnsure.length > 0)
    ) {
      steps.dateOfMarriage = true;
    }

    // personOnRecord1
    if (fullName1.length > 0 && parentsMarried1.length > 0) {
      steps.personOnRecord1 = true;
    }

    // personOnRecord2
    if (fullName2.length > 0 && parentsMarried2.length > 0) {
      steps.personOnRecord2 = true;
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

    Router.push('/marriage');
  }

  @computed
  public get dateString(): string {
    const date = this.requestInformation.dateOfMarriageExact || null;

    if (date) {
      return MemorableDateInput.formattedDateUtc(date);
    } else {
      return this.requestInformation.dateOfMarriageUnsure || '';
    }
  }

  @computed
  get fullNames(): string {
    const { maidenName1, maidenName2 } = this.requestInformation;

    const fullName1 =
      this.requestInformation.fullName1 +
      (maidenName1 ? ` (${maidenName1})` : '');
    const fullName2 =
      this.requestInformation.fullName2 +
      (maidenName2 ? ` (${maidenName2})` : '');

    return `${fullName1} & ${fullName2}`;
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
      parentsMarried1 === 'no' ||
      parentsMarried1 === 'unknown' ||
      parentsMarried2 === 'no' ||
      parentsMarried2 === 'unknown'
    );
  }
}
