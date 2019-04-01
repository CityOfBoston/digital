import {
  FetchDeathCertificates,
  SearchDeathCertificates,
  LookupDeathCertificateOrder,
  SubmitDeathCertificateOrder_submitDeathCertificateOrder,
  SubmitBirthCertificateOrder_submitBirthCertificateOrder,
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

export type CertificateType = 'death' | 'birth';

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

// Birth-specific
export type Question =
  | 'forSelf'
  | 'bornInBoston'
  | 'nameOnRecord'
  | 'birthDate'
  | 'parentsMarried'
  | 'parentsNames'
  | 'reviewRequest'
  | 'parentsLivedInBoston'
  | 'howRelated';

export type Step =
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

export type Relation =
  | 'spouse'
  | 'child'
  | 'parent'
  | 'familyMember'
  | 'friend'
  | 'client'
  | '';

export type YesNoUnknownAnswer = 'yes' | 'no' | 'unknown' | '';

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
