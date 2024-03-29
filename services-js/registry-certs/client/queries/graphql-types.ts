/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteBirthCertificateUploadedFile
// ====================================================

export interface DeleteBirthCertificateUploadedFile_deleteUpload {
  message: string | null;
  success: boolean;
}

export interface DeleteBirthCertificateUploadedFile {
  deleteUpload: DeleteBirthCertificateUploadedFile_deleteUpload;
}

export interface DeleteBirthCertificateUploadedFileVariables {
  attachmentKey: string;
  uploadSessionId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteMarriageCertificateUploadedFile
// ====================================================

export interface DeleteMarriageCertificateUploadedFile_deleteUpload {
  message: string | null;
  success: boolean;
}

export interface DeleteMarriageCertificateUploadedFile {
  deleteUpload: DeleteMarriageCertificateUploadedFile_deleteUpload;
}

export interface DeleteMarriageCertificateUploadedFileVariables {
  attachmentKey: string;
  uploadSessionId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FetchDeathCertificates
// ====================================================

export interface FetchDeathCertificates_deathCertificates_certificates {
  id: string;
  firstName: string;
  lastName: string;
  deathYear: string;
  deathDate: string | null;
  pending: boolean;
  age: string | null;
  birthDate: string | null;
}

export interface FetchDeathCertificates_deathCertificates {
  certificates: (FetchDeathCertificates_deathCertificates_certificates | null)[];
}

export interface FetchDeathCertificates {
  deathCertificates: FetchDeathCertificates_deathCertificates;
}

export interface FetchDeathCertificatesVariables {
  ids: string[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: LookupDeathCertificateOrder
// ====================================================

export interface LookupDeathCertificateOrder_deathCertificates_order_items_certificate {
  id: string;
  firstName: string;
  lastName: string;
}

export interface LookupDeathCertificateOrder_deathCertificates_order_items {
  certificate: LookupDeathCertificateOrder_deathCertificates_order_items_certificate | null;
  quantity: number;
  cost: number;
}

export interface LookupDeathCertificateOrder_deathCertificates_order {
  id: string;
  date: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  shippingName: string;
  shippingCompanyName: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  items: LookupDeathCertificateOrder_deathCertificates_order_items[];
  certificateCost: number;
  subtotal: number;
  serviceFee: number;
  total: number;
}

export interface LookupDeathCertificateOrder_deathCertificates {
  order: LookupDeathCertificateOrder_deathCertificates_order | null;
}

export interface LookupDeathCertificateOrder {
  deathCertificates: LookupDeathCertificateOrder_deathCertificates;
}

export interface LookupDeathCertificateOrderVariables {
  id: string;
  contactEmail: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SearchDeathCertificates
// ====================================================

export interface SearchDeathCertificates_deathCertificates_search_results {
  id: string;
  firstName: string;
  lastName: string;
  deathYear: string;
  deathDate: string | null;
  pending: boolean;
  age: string | null;
  birthDate: string | null;
}

export interface SearchDeathCertificates_deathCertificates_search {
  page: number;
  pageSize: number;
  pageCount: number;
  resultCount: number;
  results: SearchDeathCertificates_deathCertificates_search_results[];
}

export interface SearchDeathCertificates_deathCertificates {
  search: SearchDeathCertificates_deathCertificates_search;
}

export interface SearchDeathCertificates {
  deathCertificates: SearchDeathCertificates_deathCertificates;
}

export interface SearchDeathCertificatesVariables {
  query: string;
  page: number;
  startYear?: string | null;
  endYear?: string | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SubmitBirthCertificateOrder
// ====================================================

export interface SubmitBirthCertificateOrder_submitBirthCertificateOrder_order {
  id: string;
}

export interface SubmitBirthCertificateOrder_submitBirthCertificateOrder_error {
  message: string;
  cause: OrderErrorCause;
}

export interface SubmitBirthCertificateOrder_submitBirthCertificateOrder {
  order: SubmitBirthCertificateOrder_submitBirthCertificateOrder_order | null;
  error: SubmitBirthCertificateOrder_submitBirthCertificateOrder_error | null;
}

export interface SubmitBirthCertificateOrder {
  submitBirthCertificateOrder: SubmitBirthCertificateOrder_submitBirthCertificateOrder;
}

export interface SubmitBirthCertificateOrderVariables {
  contactName: string;
  contactEmail: string;
  confirmContactEmail: string;
  contactPhone: string;
  shippingName: string;
  shippingCompanyName: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  cardToken: string;
  cardLast4: string;
  cardholderName: string;
  billingAddress1: string;
  billingAddress2: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  item: BirthCertificateOrderItemInput;
  idempotencyKey: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SubmitDeathCertificateOrder
// ====================================================

export interface SubmitDeathCertificateOrder_submitDeathCertificateOrder_order {
  id: string;
}

export interface SubmitDeathCertificateOrder_submitDeathCertificateOrder_error {
  message: string;
  cause: OrderErrorCause;
}

export interface SubmitDeathCertificateOrder_submitDeathCertificateOrder {
  order: SubmitDeathCertificateOrder_submitDeathCertificateOrder_order | null;
  error: SubmitDeathCertificateOrder_submitDeathCertificateOrder_error | null;
}

export interface SubmitDeathCertificateOrder {
  submitDeathCertificateOrder: SubmitDeathCertificateOrder_submitDeathCertificateOrder;
}

export interface SubmitDeathCertificateOrderVariables {
  contactName: string;
  contactEmail: string;
  confirmContactEmail: string;
  contactPhone: string;
  shippingName: string;
  shippingCompanyName: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  cardToken: string;
  cardLast4: string;
  cardholderName: string;
  billingAddress1: string;
  billingAddress2: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  items: DeathCertificateOrderItemInput[];
  idempotencyKey: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SubmitMarriageCertificateOrder
// ====================================================

export interface SubmitMarriageCertificateOrder_submitMarriageCertificateOrder_order {
  id: string;
}

export interface SubmitMarriageCertificateOrder_submitMarriageCertificateOrder_error {
  message: string;
  cause: OrderErrorCause;
}

export interface SubmitMarriageCertificateOrder_submitMarriageCertificateOrder {
  order: SubmitMarriageCertificateOrder_submitMarriageCertificateOrder_order | null;
  error: SubmitMarriageCertificateOrder_submitMarriageCertificateOrder_error | null;
}

export interface SubmitMarriageCertificateOrder {
  submitMarriageCertificateOrder: SubmitMarriageCertificateOrder_submitMarriageCertificateOrder;
}

export interface SubmitMarriageCertificateOrderVariables {
  contactName: string;
  contactEmail: string;
  confirmContactEmail: string;
  contactPhone: string;
  shippingName: string;
  shippingCompanyName: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  cardToken: string;
  cardLast4: string;
  cardholderName: string;
  billingAddress1: string;
  billingAddress2: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  item: MarriageCertificateOrderItemInput;
  idempotencyKey: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SubmitMarriageIntentionCertificateOrder
// ====================================================

export interface SubmitMarriageIntentionCertificateOrder_submitMarriageIntentionCertificateOrder_order {
  id: string;
}

export interface SubmitMarriageIntentionCertificateOrder_submitMarriageIntentionCertificateOrder_error {
  message: string;
  cause: OrderErrorCause;
}

export interface SubmitMarriageIntentionCertificateOrder_submitMarriageIntentionCertificateOrder {
  order: SubmitMarriageIntentionCertificateOrder_submitMarriageIntentionCertificateOrder_order | null;
  error: SubmitMarriageIntentionCertificateOrder_submitMarriageIntentionCertificateOrder_error | null;
}

export interface SubmitMarriageIntentionCertificateOrder {
  submitMarriageIntentionCertificateOrder: SubmitMarriageIntentionCertificateOrder_submitMarriageIntentionCertificateOrder;
}

export interface SubmitMarriageIntentionCertificateOrderVariables {
  email: string;
  dayPhoneUnformattedStr: string;
  appointmentDate: string;
  partnerA_firstName: string;
  partnerA_lastName: string;
  partnerA_middleName: string;
  partnerA_suffix: string;
  partnerA_surName: string;
  partnerA_dob: string;
  partnerA_age: string;
  partnerA_occupation: string;
  partnerA_sex: string;
  partnerA_bloodRelation: string;
  partnerA_bloodRelationDesc: string;
  partnerA_parentsMarriedAtBirth: string;
  partnerA_parentA_Name: string;
  partnerA_parentB_Name: string;
  partnerA_parentA_Surname: string;
  partnerA_parentB_Surname: string;
  partnerA_birthCity: string;
  partnerA_birthState: string;
  partnerA_birthCountry: string;
  partnerA_birthHospital: string;
  partnerA_partnershipType: string;
  partnerA_partnershipTypeDissolved: string;
  partnerA_partnershipState: string;
  partnerA_residenceAddress: string;
  partnerA_residenceCity: string;
  partnerA_residenceState: string;
  partnerA_residenceCountry: string;
  partnerA_residenceZip: string;
  partnerA_marriageNumb: string;
  partnerA_lastMarriageStatus: string;
  partnerB_firstName: string;
  partnerB_lastName: string;
  partnerB_middleName: string;
  partnerB_suffix: string;
  partnerB_surName: string;
  partnerB_dob: string;
  partnerB_age: string;
  partnerB_occupation: string;
  partnerB_sex: string;
  partnerB_bloodRelation: string;
  partnerB_bloodRelationDesc: string;
  partnerB_parentsMarriedAtBirth: string;
  partnerB_parentA_Name: string;
  partnerB_parentB_Name: string;
  partnerB_parentA_Surname: string;
  partnerB_parentB_Surname: string;
  partnerB_birthCity: string;
  partnerB_birthState: string;
  partnerB_birthCountry: string;
  partnerB_birthHospital: string;
  partnerB_partnershipType: string;
  partnerB_partnershipTypeDissolved: string;
  partnerB_partnershipState: string;
  partnerB_residenceAddress: string;
  partnerB_residenceCity: string;
  partnerB_residenceState: string;
  partnerB_residenceZip: string;
  partnerB_residenceCountry: string;
  partnerB_marriageNumb: string;
  partnerB_lastMarriageStatus: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum OrderErrorCause {
  INTERNAL = "INTERNAL",
  USER_PAYMENT = "USER_PAYMENT",
}

export interface BirthCertificateOrderItemInput {
  alternateSpellings: string;
  birthDate: string;
  firstName: string;
  lastName: string;
  parent1FirstName: string;
  parent1LastName: string;
  parent2FirstName: string;
  parent2LastName: string;
  quantity: number;
  requestDetails: string;
  uploadSessionId: string;
}

export interface DeathCertificateOrderItemInput {
  id: string;
  name: string;
  quantity: number;
}

export interface MarriageCertificateOrderItemInput {
  altSpellings1: string;
  altSpellings2: string;
  dateOfMarriageExact: string;
  dateOfMarriageUnsure: string;
  fullName1: string;
  fullName2: string;
  maidenName1: string;
  maidenName2: string;
  quantity: number;
  requestDetails: string;
  uploadSessionId: string;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
