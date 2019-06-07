import {
  FetchDeathCertificates,
  SearchDeathCertificates,
  LookupDeathCertificateOrder,
  SubmitDeathCertificateOrder_submitDeathCertificateOrder,
  SubmitBirthCertificateOrder_submitBirthCertificateOrder,
  SubmitMarriageCertificateOrder_submitMarriageCertificateOrder,
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
  | '';

export type YesNoUnknownAnswer = 'yes' | 'no' | 'unknown' | '';

// Death-specific
export interface DeathCertificate
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
  bornInBoston: YesNoUnknownAnswer;
  parentsLivedInBoston?: YesNoUnknownAnswer;
  firstName: string;
  lastName: string;
  altSpelling: string;
  birthDate?: Date | null;
  parentsMarried: YesNoUnknownAnswer;
  parent1FirstName: string;
  parent1LastName: string;
  parent2FirstName: string;
  parent2LastName: string;

  // only required if parentsMarried !== true:
  idImageFront?: UploadableFile | null;
  idImageBack?: UploadableFile | null;
  supportingDocuments: UploadableFile[];
};

export type MarriageCertificateRequestInformation = {
  forSelf: boolean | null;
  howRelated?: Relation;
  filedInBoston: YesNoUnknownAnswer;
  dateOfMarriageStart: Date | null;
  dateOfMarriageEnd?: Date | null;
  firstName1: string;
  firstName2: string;
  lastName1: string;
  lastName2: string;
  maidenName1?: string;
  maidenName2?: string;
  parentsMarried1: YesNoUnknownAnswer;
  parentsMarried2: YesNoUnknownAnswer;

  // only required if parentsMarried[1, 2] !== true:
  idImageFront?: UploadableFile | null;
  idImageBack?: UploadableFile | null;
  supportingDocuments: UploadableFile[];
};
