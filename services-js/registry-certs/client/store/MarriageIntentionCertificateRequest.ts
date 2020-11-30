import { action, observable, computed, autorun } from 'mobx';
import uuidv4 from 'uuid/v4';
import Router from 'next/router';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';
// import { MemorableDateInput } from '@cityofboston/react-fleet';

import {
  MarriageIntentionCertificateRequestInformation,
  MarriageIntentionStep,
  JSONObject,
  JSONValue,
} from '../types';
// import { CERTIFICATE_COST } from '../../lib/costs';

// const MARRIAGE_INTENTION_CERTIFICATE_COST = CERTIFICATE_COST.INTENTION;

import { SEX_CHECKBOX } from '../../client/marriageintention/forms/inputData';

export const INITIAL_REQUEST_INFORMATION: Readonly<
  MarriageIntentionCertificateRequestInformation
> = {
  partnerA_fullName: '',
  partnerA_firstMiddleName: '',
  partnerA_suffix: '',
  partnerA_firstName: '',
  partnerA_lastName: '',
  partnerA_middleName: '',
  partnerA_surName: '',
  partnerA_dob: null,
  partnerA_age: '',
  partnerA_occupation: '',
  partnerA_sex: '',
  partnerA_bloodRelation: '',
  partnerA_bloodRelationDesc: '',
  partnerA_parentsMarriedAtBirth: '',
  partnerA_parentA_Name: '',
  partnerA_parentA_Surname: '',
  partnerA_parentB_Name: '',
  partnerA_parentB_Surname: '',
  partnerA_birthHospital: '',
  partnerA_birthCity: '',
  partnerA_birthState: '',
  partnerA_birthCountry: '',
  partnerA_birthZip: '',
  partnerA_partnershipType: '',
  partnerA_partnershipTypeDissolved: '',
  partnerA_partnershipState: '',
  partnerA_residenceAddress: '',
  partnerA_residenceCountry: '',
  partnerA_residenceCity: '',
  partnerA_residenceState: '',
  partnerA_residenceZip: '',
  partnerA_marriageNumb: '',
  partnerA_lastMarriageStatus: '',

  partnerB_fullName: '',
  partnerB_firstMiddleName: '',
  partnerB_suffix: '',
  partnerB_firstName: '',
  partnerB_lastName: '',
  partnerB_middleName: '',
  partnerB_surName: '',
  partnerB_dob: null,
  partnerB_age: '',
  partnerB_occupation: '',
  partnerB_sex: '',
  partnerB_bloodRelation: '',
  partnerB_bloodRelationDesc: '',
  partnerB_parentsMarriedAtBirth: '',
  partnerB_parentA_Name: '',
  partnerB_parentA_Surname: '',
  partnerB_parentB_Name: '',
  partnerB_parentB_Surname: '',
  partnerB_birthHospital: '',
  partnerB_birthCity: '',
  partnerB_birthState: '',
  partnerB_birthCountry: '',
  partnerB_birthZip: '',
  partnerB_partnershipType: '',
  partnerB_partnershipTypeDissolved: '',
  partnerB_partnershipState: '',
  partnerB_residenceAddress: '',
  partnerB_residenceCountry: '',
  partnerB_residenceCity: '',
  partnerB_residenceState: '',
  partnerB_residenceZip: '',
  partnerB_marriageNumb: '',
  partnerB_lastMarriageStatus: '',

  email: '',
  dayPhone: '',
  appointmentDate: null,
};

export const QUESTION_STEPS: MarriageIntentionStep[] = [
  'instructions',
  'partnerFormA',
  'partnerFormB',
  'contactInfo',
  'reviewForms',
];

export const CHECKOUT_STEPS: MarriageIntentionStep[] = ['reviewRequest'];

type MarriageIntentionCertificateRequestInformationJson = {
  [k in NonNullable<
    keyof MarriageIntentionCertificateRequestInformation
  >]: JSONValue
};

const SESSION_STORAGE_KEY = 'marriageIntentionCertificateRequest';

export default class MarriageIntentionCertificateRequest {
  @observable
  requestInformation: MarriageIntentionCertificateRequestInformation = INITIAL_REQUEST_INFORMATION;

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
    requestInformation: MarriageIntentionCertificateRequestInformation
  ): void {
    this.requestInformation = requestInformation;
  }

  serializeToJSON(): JSONObject {
    const serializedRequestInformation: MarriageIntentionCertificateRequestInformationJson = {
      partnerA_fullName: this.requestInformation.partnerA_fullName,
      partnerA_firstMiddleName: this.requestInformation
        .partnerA_firstMiddleName,
      partnerA_suffix: this.requestInformation.partnerA_suffix,
      partnerA_firstName: this.requestInformation.partnerA_firstName,
      partnerA_lastName: this.requestInformation.partnerA_lastName,
      partnerA_middleName: this.requestInformation.partnerA_middleName,
      partnerA_surName: this.requestInformation.partnerA_surName,
      partnerA_dob: this.requestInformation.partnerA_dob
        ? this.requestInformation.partnerA_dob.toISOString()
        : null,
      partnerA_age: this.requestInformation.partnerA_age,
      partnerA_occupation: this.requestInformation.partnerA_occupation,
      partnerA_sex: this.requestInformation.partnerA_sex || null,
      partnerA_bloodRelation:
        this.requestInformation.partnerA_bloodRelation || null,
      partnerA_bloodRelationDesc: this.requestInformation
        .partnerA_bloodRelationDesc,
      partnerA_parentsMarriedAtBirth:
        this.requestInformation.partnerA_parentsMarriedAtBirth || null,
      partnerA_parentA_Name: this.requestInformation.partnerA_parentA_Name,
      partnerA_parentA_Surname: this.requestInformation
        .partnerA_parentA_Surname,
      partnerA_parentB_Name: this.requestInformation.partnerA_parentB_Name,
      partnerA_parentB_Surname: this.requestInformation
        .partnerA_parentB_Surname,
      partnerA_birthHospital: this.requestInformation.partnerA_birthHospital,
      partnerA_birthCity: this.requestInformation.partnerA_birthCity,
      partnerA_birthState: this.requestInformation.partnerA_birthState,
      partnerA_birthCountry: this.requestInformation.partnerA_birthCountry,
      partnerA_birthZip: this.requestInformation.partnerA_birthZip,
      partnerA_partnershipType: this.requestInformation
        .partnerA_partnershipType,
      partnerA_partnershipTypeDissolved: this.requestInformation
        .partnerA_partnershipTypeDissolved,
      partnerA_partnershipState: this.requestInformation
        .partnerA_partnershipState,
      partnerA_residenceAddress: this.requestInformation
        .partnerA_residenceAddress,
      partnerA_residenceCountry: this.requestInformation
        .partnerA_residenceCountry,
      partnerA_residenceCity: this.requestInformation.partnerA_residenceCity,
      partnerA_residenceState: this.requestInformation.partnerA_residenceState,
      partnerA_residenceZip: this.requestInformation.partnerA_residenceZip,
      partnerA_marriageNumb: this.requestInformation.partnerA_marriageNumb,
      partnerA_lastMarriageStatus: this.requestInformation
        .partnerA_lastMarriageStatus,

      partnerB_fullName: this.requestInformation.partnerB_fullName,
      partnerB_firstMiddleName: this.requestInformation
        .partnerB_firstMiddleName,
      partnerB_suffix: this.requestInformation.partnerB_suffix,
      partnerB_firstName: this.requestInformation.partnerB_firstName,
      partnerB_lastName: this.requestInformation.partnerB_lastName,
      partnerB_middleName: this.requestInformation.partnerB_middleName,
      partnerB_surName: this.requestInformation.partnerB_surName,
      partnerB_dob: this.requestInformation.partnerB_dob
        ? this.requestInformation.partnerB_dob.toISOString()
        : null,
      partnerB_age: this.requestInformation.partnerB_age,
      partnerB_occupation: this.requestInformation.partnerB_occupation,
      partnerB_sex: this.requestInformation.partnerB_sex || null,
      partnerB_bloodRelation:
        this.requestInformation.partnerB_bloodRelation || null,
      partnerB_bloodRelationDesc: this.requestInformation
        .partnerB_bloodRelationDesc,
      partnerB_parentsMarriedAtBirth:
        this.requestInformation.partnerB_parentsMarriedAtBirth || null,
      partnerB_parentA_Name: this.requestInformation.partnerB_parentA_Name,
      partnerB_parentA_Surname: this.requestInformation
        .partnerB_parentA_Surname,
      partnerB_parentB_Name: this.requestInformation.partnerB_parentB_Name,
      partnerB_parentB_Surname: this.requestInformation
        .partnerB_parentB_Surname,
      partnerB_birthHospital: this.requestInformation.partnerB_birthHospital,
      partnerB_birthCity: this.requestInformation.partnerB_birthCity,
      partnerB_birthState: this.requestInformation.partnerB_birthState,
      partnerB_birthCountry: this.requestInformation.partnerB_birthCountry,
      partnerB_birthZip: this.requestInformation.partnerB_birthZip,
      partnerB_partnershipType: this.requestInformation
        .partnerB_partnershipType,
      partnerB_partnershipTypeDissolved: this.requestInformation
        .partnerB_partnershipTypeDissolved,
      partnerB_partnershipState: this.requestInformation
        .partnerB_partnershipState,
      partnerB_residenceAddress: this.requestInformation
        .partnerB_residenceAddress,
      partnerB_residenceCountry: this.requestInformation
        .partnerB_residenceCountry,
      partnerB_residenceCity: this.requestInformation.partnerB_residenceCity,
      partnerB_residenceState: this.requestInformation.partnerB_residenceState,
      partnerB_residenceZip: this.requestInformation.partnerB_residenceZip,
      partnerB_marriageNumb: this.requestInformation.partnerB_marriageNumb,
      partnerB_lastMarriageStatus: this.requestInformation
        .partnerB_lastMarriageStatus,

      email: this.requestInformation.email,
      dayPhone: this.requestInformation.dayPhone,
      appointmentDate: this.requestInformation.appointmentDate
        ? this.requestInformation.appointmentDate.toISOString()
        : null,
      // appointmentTime: this.requestInformation.appointmentTime,
    };

    return {
      uploadSessionId: this.uploadSessionId,
      requestInformation: serializedRequestInformation,
    };
  }

  @action
  replaceWithJson(obj: any) {
    this.uploadSessionId = obj.uploadSessionId;
    this.requestInformation = {
      partnerA_fullName: this.requestInformation.partnerA_fullName,
      partnerA_firstMiddleName: this.requestInformation
        .partnerA_firstMiddleName,
      partnerA_suffix: this.requestInformation.partnerA_suffix,
      partnerA_firstName: obj.requestInformation.partnerA_firstName,
      partnerA_lastName: obj.requestInformation.partnerA_lastName,
      partnerA_middleName: obj.requestInformation.partnerA_middleName,
      partnerA_surName: obj.requestInformation.partnerA_surName,
      partnerA_dob: obj.requestInformation.partnerA_dob
        ? new Date(obj.requestInformation.partnerA_dob)
        : null,
      partnerA_age: obj.requestInformation.partnerA_age,
      partnerA_occupation: obj.requestInformation.partnerA_occupation,
      partnerA_sex: obj.requestInformation.partnerA_sex || null,
      partnerA_bloodRelation:
        obj.requestInformation.partnerA_bloodRelation || null,
      partnerA_bloodRelationDesc:
        obj.requestInformation.partnerA_bloodRelationDesc,
      partnerA_parentsMarriedAtBirth:
        obj.requestInformation.partnerA_parentsMarriedAtBirth,
      partnerA_parentA_Name: obj.requestInformation.partnerA_parentA_Name,
      partnerA_parentA_Surname: obj.requestInformation.partnerA_parentA_Surname,
      partnerA_parentB_Name: obj.requestInformation.partnerA_parentB_Name,
      partnerA_parentB_Surname: obj.requestInformation.partnerA_parentB_Surname,
      partnerA_birthHospital: obj.requestInformation.partnerA_birthHospital,
      partnerA_birthCity: obj.requestInformation.partnerA_birthCity,
      partnerA_birthState: obj.requestInformation.partnerA_birthState,
      partnerA_birthCountry: obj.requestInformation.partnerA_birthCountry,
      partnerA_birthZip: obj.requestInformation.partnerA_birthZip,
      partnerA_partnershipType: obj.requestInformation.partnerA_partnershipType,
      partnerA_partnershipTypeDissolved:
        obj.requestInformation.partnerA_partnershipTypeDissolved,
      partnerA_partnershipState:
        obj.requestInformation.partnerA_partnershipState,
      partnerA_residenceAddress: this.requestInformation
        .partnerA_residenceAddress,
      partnerA_residenceCountry:
        obj.requestInformation.partnerA_residenceCountry,
      partnerA_residenceCity: obj.requestInformation.partnerA_residenceCity,
      partnerA_residenceState: obj.requestInformation.partnerA_residenceState,
      partnerA_residenceZip: obj.requestInformation.partnerA_residenceZip,
      partnerA_marriageNumb: obj.requestInformation.partnerA_marriageNumb,
      partnerA_lastMarriageStatus:
        obj.requestInformation.partnerA_lastMarriageStatus,

      partnerB_fullName: this.requestInformation.partnerB_fullName,
      partnerB_firstMiddleName: this.requestInformation
        .partnerB_firstMiddleName,
      partnerB_suffix: this.requestInformation.partnerB_suffix,
      partnerB_firstName: obj.requestInformation.partnerB_firstName,
      partnerB_lastName: obj.requestInformation.partnerB_lastName,
      partnerB_middleName: obj.requestInformation.partnerB_middleName,
      partnerB_surName: obj.requestInformation.partnerB_surName,
      partnerB_dob: obj.requestInformation.partnerB_dob
        ? new Date(obj.requestInformation.partnerB_dob)
        : null,
      partnerB_age: obj.requestInformation.partnerB_age,
      partnerB_occupation: obj.requestInformation.partnerB_occupation,
      partnerB_sex: obj.requestInformation.partnerB_sex || null,
      partnerB_bloodRelation:
        obj.requestInformation.partnerB_bloodRelation || null,
      partnerB_bloodRelationDesc:
        obj.requestInformation.partnerB_bloodRelationDesc,
      partnerB_parentsMarriedAtBirth:
        obj.requestInformation.partnerB_parentsMarriedAtBirth,
      partnerB_parentA_Name: obj.requestInformation.partnerB_parentA_Name,
      partnerB_parentA_Surname: obj.requestInformation.partnerB_parentA_Surname,
      partnerB_parentB_Name: obj.requestInformation.partnerB_parentB_Name,
      partnerB_parentB_Surname: obj.requestInformation.partnerB_parentB_Surname,
      partnerB_birthHospital: obj.requestInformation.partnerB_birthHospital,
      partnerB_birthCity: obj.requestInformation.partnerB_birthCity,
      partnerB_birthState: obj.requestInformation.partnerB_birthState,
      partnerB_birthCountry: obj.requestInformation.partnerB_birthCountry,
      partnerB_birthZip: obj.requestInformation.partnerB_birthZip,
      partnerB_partnershipType: obj.requestInformation.partnerB_partnershipType,
      partnerB_partnershipTypeDissolved:
        obj.requestInformation.partnerB_partnershipTypeDissolved,
      partnerB_partnershipState:
        obj.requestInformation.partnerB_partnershipState,
      partnerB_residenceAddress: this.requestInformation
        .partnerB_residenceAddress,
      partnerB_residenceCountry:
        obj.requestInformation.partnerB_residenceCountry,
      partnerB_residenceCity: obj.requestInformation.partnerB_residenceCity,
      partnerB_residenceState: obj.requestInformation.partnerB_residenceState,
      partnerB_residenceZip: obj.requestInformation.partnerB_residenceZip,
      partnerB_marriageNumb: obj.requestInformation.partnerB_marriageNumb,
      partnerB_lastMarriageStatus:
        obj.requestInformation.partnerB_lastMarriageStatus,

      email: obj.requestInformation.email,
      dayPhone: obj.requestInformation.dayPhone,
      appointmentDate: obj.requestInformation.appointmentDate
        ? obj.requestInformation.appointmentDate.toISOString()
        : null,
      // appointmentTime: obj.requestInformation.appointmentTime,
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
  public get steps(): MarriageIntentionStep[] {
    return [
      ...QUESTION_STEPS,
      // ...(this.needsIdentityVerification ? VERIFY_IDENTIFICATION_STEPS : []),
      ...CHECKOUT_STEPS,
    ];
  }

  @computed
  public get needsIdentityVerification(): boolean {
    return true;
  }

  // A user’s answer may span several fields:
  @action
  public answerQuestion(
    answers: Partial<MarriageIntentionCertificateRequestInformation>,
    partnerLabel: string
  ): void {
    partnerLabel = partnerLabel || '';
    if (partnerLabel === '') {
      this.requestInformation = {
        ...this.requestInformation,
        ...answers,
      };
    } else {
      this.requestInformation = {
        ...this.requestInformation[partnerLabel],
        ...answers,
      };
    }
  }

  @action
  public isEmailValid(val) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const parsedEmail = emailRegex.test(val);

    return parsedEmail;
  }

  @action
  public getGenderLabel(val) {
    return SEX_CHECKBOX.find(obj => obj.value === val);
  }

  @action
  public formatPhoneNumber(phoneStr) {
    let formatted = '';

    if (phoneStr.length > 10) {
      formatted = phoneStr.replace(/(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
    } else {
      formatted = phoneStr.replace(/(\d{3})(\d{3})(\d{4})/, '($1)-$2-$3');
    }
    return formatted;
  }

  // Returns an object that expresses whether or not each question step
  // is complete.
  @computed
  public get completedQuestionSteps() {
    const steps = {
      partnerFormA: true,
      partnerFormB: true,
    };

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
    this.requestInformation = INITIAL_REQUEST_INFORMATION;
    this.uploadSessionId = uuidv4();

    Router.push('/marriageintention');
  }

  /**
   * Use this to make a copy that you can modify without changing the global
   * MarriageIntentionCertificateRequest.
   */
  @action
  public clone(): MarriageIntentionCertificateRequest {
    const marriageIntentionCertificateRequest = new MarriageIntentionCertificateRequest();

    return Object.assign(marriageIntentionCertificateRequest, this);
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
