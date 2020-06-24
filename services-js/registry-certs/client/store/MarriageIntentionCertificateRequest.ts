import { action, observable, computed, autorun } from 'mobx';

// import uuidv4 from 'uuid/v4';
import Router from 'next/router';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';
// import { MemorableDateInput } from '@cityofboston/react-fleet';

import {
  MarriageIntentionCertificateRequestInformation,
  MarriageIntentionStep,
  JSONObject,
  JSONValue,
} from '../types';

// This is used for initial state during the questions flow, and to
// reset all fields if user selects “start over”
export const INITIAL_REQUEST_INFORMATION: Readonly<
  MarriageIntentionCertificateRequestInformation
> = {
  disclaimer: null,
  // reviewForm: null,
  personAFirstName: '',
  personBFirstName: '',
  personALastName: '',
  personBLastName: '',
};

export const QUESTION_STEPS: MarriageIntentionStep[] = [
  'disclaimer',
  'partyAForm',
  'partyBForm',
];

export const CHECKOUT_STEPS: MarriageIntentionStep[] = ['reviewForm'];

/**
 * Type that has all the same keys as MarriageIntentionCertificateRequestInformation but its
 * values are all JSON-serializable.
 */
type MarriageIntentionCertificateRequestInformationJson = {
  [k in NonNullable<
    keyof MarriageIntentionCertificateRequestInformation
  >]: JSONValue
};

const SESSION_STORAGE_KEY = 'marriageIntentionCertificateRequest';

/**
 * State object for a marriage intenttion request.
 *
 * steps: All steps in request flow. If a record is (probably) restricted,
 * 'verifyInformation' must be added after 'parentalInformation'.
 *
 * currentStep: Name of the current step in the overall request flow
 *
 * currentStepCompleted: Whether or not the currentStep has been completed (for
 * progress bar display/user feedback)

 * requestInformation: Information needed by the Registry to process request
 */

export default class MarriageIntentionCertificateRequest {
  @observable
  requestInformation: MarriageIntentionCertificateRequestInformation = INITIAL_REQUEST_INFORMATION;

  public siteAnalytics: GaSiteAnalytics | null = null;

  private sessionStorageDisposer: Function | null = null;

  constructor() {}

  @action
  setSiteAnalytics(siteAnalytics: GaSiteAnalytics) {
    this.siteAnalytics = siteAnalytics;
  }

  // @action
  // setRequestInformation(
  //   requestInformation: MarriageIntentionCertificateRequestInformation
  // ): void {
  //   this.requestInformation = this.requestInformation;
  // }

  /**
   * Converts the important parts of the request to JSON for sessionstorage
   * serialization.
   *
   * We explicitly don’t call this "toJSON" because we don’t want Jest’s
   * snapshot serializer to use it.
   */
  serializeToJSON(): JSONObject {
    const serializedRequestInformation: MarriageIntentionCertificateRequestInformationJson = {
      disclaimer: this.requestInformation.disclaimer,
      // reviewForm: this.requestInformation.reviewForm,
      personAFirstName: this.requestInformation.personAFirstName,
      personBFirstName: this.requestInformation.personBFirstName,
      personALastName: this.requestInformation.personBFirstName,
      personBLastName: this.requestInformation.personBLastName,
      // personABirthDate: this.requestInformation.personABirthDate,
      // personBBirthDate: this.requestInformation.personBBirthDate,
    };

    return {
      requestInformation: serializedRequestInformation,
    };
  }

  /**
   * Inverse of #toJSON.
   */
  @action
  replaceWithJson(obj: any) {
    this.requestInformation = {
      disclaimer: obj.requestInformation.disclaimer,
      // reviewForm: obj.requestInformation.reviewForm,
      personAFirstName: obj.requestInformation.personAFirstName,
      personBFirstName: obj.requestInformation.personAFirstName,
      personALastName: obj.requestInformation.personALastName,
      personBLastName: obj.requestInformation.personBLastName,
      // personABirthDate: obj.requestInformation.personABirthDate,
      // personBBirthDate: obj.requestInformation.personBBirthDate,
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
          // If there's a problem with the saved data then we want to wipe it out
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
  public get steps(): MarriageIntentionStep[] {
    return [...QUESTION_STEPS, ...CHECKOUT_STEPS];
  }

  // A user’s answer may span several fields:
  @action
  public answerQuestion(
    answers: Partial<MarriageIntentionCertificateRequestInformation>
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
      disclaimer: false,
      partyAForm: false,
      partyBForm: false,
      reviewForm: false,
    };

    const {
      disclaimer,
      personAFirstName,
      personBFirstName,
      personALastName,
      personBLastName,
      // personABirthDate,
      // personBBirthDate,
    } = this.requestInformation;

    // disclaimer
    if (disclaimer) {
      steps.disclaimer = true;
    }

    // Form 1
    if (personAFirstName && personALastName) {
      steps.partyAForm = true;
    }

    // Form 2
    if (personBFirstName && personBLastName) {
      steps.partyBForm = true;
    }

    if (personBFirstName && personBLastName) {
      steps.reviewForm = true;
    }

    return steps;
  }

  // Returns true if all question steps have been completed.
  @computed
  public get questionsStepsComplete(): boolean {
    const steps = this.completedQuestionSteps;

    // Return false if any step is not complete.
    return !Object.keys(steps).find(key => !steps[key]);
  }

  @action
  public clearCertificateRequest(): void {
    this.requestInformation = INITIAL_REQUEST_INFORMATION;

    Router.push('/marriage-intention');
  }

  // @computed
  // public get dateString(): string {
  //   const date = this.requestInformation.personABirthDate || null;

  //   if (date) {
  //     return MemorableDateInput.formattedDateUtc(date);
  //   } else {
  //     return '';
  //   }
  // }

  @computed
  get fullNames(): Array<String> {
    const {
      personAFirstName,
      personBFirstName,
      personALastName,
      personBLastName,
    } = this.requestInformation;

    const fullName1 = `${personAFirstName} ${personALastName}`;
    const fullName2 = `${personBFirstName} ${personBLastName}`;

    return [fullName1, fullName2];
  }

  /**
   * Use this to make a copy that you can modify without changing the global
   * MarriageIntentionCertificateRequest.
   */
  @action
  public clone(): MarriageIntentionCertificateRequest {
    const marriageIntentCertificateRequest = new MarriageIntentionCertificateRequest();
    return Object.assign(marriageIntentCertificateRequest, this);
  }

  /**
   * Use this to move any changes from a local MarriageIntentionCertificateRequest, created
   * with clone(), to the global MarriageIntentionCertificateRequest.
   */
  @action
  public updateFrom(req: MarriageIntentionCertificateRequest) {
    Object.assign(this, req);
  }
}
