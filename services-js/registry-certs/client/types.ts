import {
  FetchDeathCertificates,
  SearchDeathCertificates,
  LookupDeathCertificateOrder,
  SubmitDeathCertificateOrder_submitDeathCertificateOrder,
  SubmitBirthCertificateOrder_submitBirthCertificateOrder,
  SubmitMarriageCertificateOrder_submitMarriageCertificateOrder,
  SubmitMarriageIntentionCertificateOrder_submitMarriageIntentionCertificateOrder,
} from './queries/graphql-types';

import UploadableFile from './models/UploadableFile';

export type JSONValue =
  | string
  | number
  | boolean
  | JSONObject
  | JSONArray
  | null;

export type JSONObject = {
  [x: string]: JSONValue;
};

export interface JSONArray extends Array<JSONValue> {}

export type CertificateType = 'death' | 'birth' | 'marriage';

export type Relation =
  | 'spouse'
  | 'child'
  | 'parent'
  | 'familyMember'
  | 'friend'
  | 'client'
  | 'other'
  | '';

export type yesNoUnknownAnswer = 'yes' | 'no' | 'unknown' | '';

// Death-specific
export interface DeathCertificate
  extends NonNullable<
    FetchDeathCertificates['deathCertificates']['certificates'][0]
  > {}

// Intention-specific
export interface IntentionCertificate
  extends NonNullable<
    FetchDeathCertificates['deathCertificates']['certificates'][0]
  > {}

export interface DeathCertificateSearchResults
  extends NonNullable<SearchDeathCertificates['deathCertificates']['search']> {}

export interface DeathCertificateOrder
  extends NonNullable<
    LookupDeathCertificateOrder['deathCertificates']['order']
  > {}

export type DeathCertificateOrderResult = SubmitDeathCertificateOrder_submitDeathCertificateOrder;
export type BirthCertificateOrderResult = SubmitBirthCertificateOrder_submitBirthCertificateOrder;
export type MarriageCertificateOrderResult = SubmitMarriageCertificateOrder_submitMarriageCertificateOrder;
export type MarriageIntentionCertificateOrderResult = SubmitMarriageIntentionCertificateOrder_submitMarriageIntentionCertificateOrder;

// Birth-specific
export type BirthQuestion =
  | 'forSelf'
  | 'bornInBoston'
  | 'nameOnRecord'
  | 'birthDate'
  | 'parentsMarried'
  | 'parentsNames'
  | 'reviewRequest'
  | 'parentsLivedInBoston'
  | 'howRelated';

export type BirthStep =
  | 'forWhom'
  | 'clientInstructions'
  | 'bornInBoston'
  | 'personalInformation'
  | 'parentalInformation'
  | 'verifyIdentification'
  | 'reviewRequest'
  | 'shippingInformation'
  | 'billingInformation'
  | 'submitRequest';

export type MarriageIntentionQuestion = 'introStart';

export type MarriageIntentionStep =
  | 'instructions'
  | 'partnerFormA'
  | 'partnerFormB'
  | 'contactInfo'
  | 'reviewForms'
  | 'reviewRequest';

export type MarriageIntentionStepLabels =
  | 'Getting Started'
  | 'Person 1'
  | 'Person 2'
  | 'Contact Info'
  | 'Review'
  | 'Submit';

export type IntentionQuestion = 'introStart';

// Marriage-specific
export type MarriageQuestion =
  | 'forSelf'
  | 'howRelated'
  | 'filedInBoston'
  | 'dateOfMarriage'
  | 'nameOnRecord1'
  | 'nameOnRecord2'
  | 'parentsMarried1'
  | 'parentsMarried2';

export type MarriageStep =
  | 'forWhom'
  | 'clientInstructions'
  | 'filedInBoston'
  | 'dateOfMarriage'
  | 'personOnRecord1'
  | 'personOnRecord2'
  | 'verifyIdentification'
  | 'reviewRequest'
  | 'shippingInformation'
  | 'billingInformation'
  | 'submitRequest';

export type BirthCertificateRequestInformation = {
  forSelf: boolean | null;
  howRelated?: Relation;
  bornInBoston: yesNoUnknownAnswer;
  parentsLivedInBoston?: yesNoUnknownAnswer;
  firstName: string;
  lastName: string;
  altSpelling: string;
  birthDate?: Date | null;
  parentsMarried: yesNoUnknownAnswer;
  parent1FirstName: string;
  parent1LastName: string;
  parent2FirstName: string;
  parent2LastName: string;

  // only required if parentsMarried !== true:
  idImageFront?: UploadableFile | null;
  idImageBack?: UploadableFile | null;
  supportingDocuments: UploadableFile[];
};

export type MarriageIntentionCertificateRequestInformation = {
  partnerA_fullName: string;
  partnerA_firstMiddleName: string;
  partnerA_suffix: string;
  partnerA_firstName: string;
  partnerA_lastName: string;
  partnerA_middleName: string;
  partnerA_surName: string;
  partnerA_dob?: Date | null;
  partnerA_age: string;
  partnerA_occupation: string;
  partnerA_sex: string;
  partnerA_bloodRelation: string;
  partnerA_bloodRelationDesc: string;
  partnerA_parentsMarriedAtBirth: string;
  partnerA_parentA_Name: string;
  partnerA_parentA_Surname: string;
  partnerA_parentB_Name: string;
  partnerA_parentB_Surname: string;
  partnerA_birthHospital: string;
  partnerA_birthCity: string;
  partnerA_birthState: string;
  partnerA_birthCountry: string;
  partnerA_birthZip: string;
  partnerA_partnershipType: string;
  partnerA_partnershipTypeDissolved: string;
  partnerA_partnershipState: string;
  partnerA_residenceAddress: string;
  partnerA_residenceCountry: string;
  partnerA_residenceCity: string;
  partnerA_residenceState: string;
  partnerA_residenceZip: string;
  partnerA_marriageNumb: string;
  partnerA_lastMarriageStatus: string;

  partnerB_fullName: string;
  partnerB_firstMiddleName: string;
  partnerB_suffix: string;
  partnerB_firstName: string;
  partnerB_lastName: string;
  partnerB_middleName: string;
  partnerB_surName: string;
  partnerB_dob?: Date | null;
  partnerB_age: string;
  partnerB_occupation: string;
  partnerB_sex: string;
  partnerB_bloodRelation: string;
  partnerB_bloodRelationDesc: string;
  partnerB_parentsMarriedAtBirth: string;
  partnerB_parentA_Name: string;
  partnerB_parentA_Surname: string;
  partnerB_parentB_Name: string;
  partnerB_parentB_Surname: string;
  partnerB_birthHospital: string;
  partnerB_birthCity: string;
  partnerB_birthState: string;
  partnerB_birthCountry: string;
  partnerB_birthZip: string;
  partnerB_partnershipType: string;
  partnerB_partnershipTypeDissolved: string;
  partnerB_partnershipState: string;
  partnerB_residenceAddress: string;
  partnerB_residenceCountry: string;
  partnerB_residenceCity: string;
  partnerB_residenceState: string;
  partnerB_residenceZip: string;
  partnerB_marriageNumb: string;
  partnerB_lastMarriageStatus: string;

  email: string;
  emailConfirm: string;
  dayPhone: string;
  dayPhoneUnformattedStr: string;
  appointmentDate: Date | null;
  // appointmentTime: string;
};

export type MarriageCertificateRequestInformation = {
  forSelf: boolean | null;
  howRelated?: Relation;
  filedInBoston: yesNoUnknownAnswer;
  dateOfMarriageExact?: Date | null;
  dateOfMarriageUnsure?: string;
  fullName1: string;
  fullName2: string;
  maidenName1?: string;
  maidenName2?: string;
  altSpellings1?: string;
  altSpellings2?: string;
  parentsMarried1: yesNoUnknownAnswer;
  parentsMarried2: yesNoUnknownAnswer;
  // customerNotes?: string;

  // only required if parentsMarried[1, 2] !== true:
  idImageFront?: UploadableFile | null;
  idImageBack?: UploadableFile | null;
  supportingDocuments: UploadableFile[];
};
