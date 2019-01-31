import {
  FetchDeathCertificates,
  SearchDeathCertificates,
  LookupDeathCertificateOrder,
  SubmitDeathCertificateOrder_submitDeathCertificateOrder,
  SubmitBirthCertificateOrder_submitBirthCertificateOrder,
} from './queries/graphql-types';

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

export interface BirthCertificateRequestInformation {
  forSelf: boolean | null;
  howRelated?: Relation;
  bornInBoston: YesNoUnknownAnswer;
  parentsLivedInBoston?: YesNoUnknownAnswer;
  firstName: string;
  lastName: string;
  altSpelling?: string;
  birthDate: string;
  parentsMarried: YesNoUnknownAnswer;
  parent1FirstName: string;
  parent1LastName?: string;
  parent2FirstName?: string;
  parent2LastName?: string;
}
