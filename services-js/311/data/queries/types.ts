/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: LoadCase
// ====================================================

export interface LoadCase_case_service {
  name: string;
  code: string;
}

export interface LoadCase_case_location {
  lat: number;
  lng: number;
}

export interface LoadCase_case_images {
  tags: string[];
  originalUrl: string;
  squarePreviewUrl: string;
}

export interface LoadCase_case {
  id: string;
  service: LoadCase_case_service;
  status: string;
  serviceNotice: string | null;
  closureReason: string | null;
  closureComment: string | null;
  description: string | null;
  address: string | null;
  location: LoadCase_case_location | null;
  images: LoadCase_case_images[];
  requestedAtString: string | null;
  updatedAtString: string | null;
  expectedAtString: string | null;
}

export interface LoadCase {
  case: LoadCase_case | null;
}

export interface LoadCaseVariables {
  id: string;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: LoadServiceSuggestions
// ====================================================

export interface LoadServiceSuggestions_servicesForDescription {
  name: string;
  code: string;
  description: string | null;
  group: string | null;
}

export interface LoadServiceSuggestions {
  servicesForDescription: LoadServiceSuggestions_servicesForDescription[];
}

export interface LoadServiceSuggestionsVariables {
  text: string;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: LoadServiceSummaries
// ====================================================

export interface LoadServiceSummaries_services {
  code: string;
  name: string;
  description: string | null;
  group: string | null;
}

export interface LoadServiceSummaries {
  services: LoadServiceSummaries_services[];
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: LoadService
// ====================================================

export interface LoadService_service_attributes_values {
  key: string;
  name: string;
}

export interface LoadService_service_attributes_validations_dependentOn_conditions_value {
  type: ServiceAttributeConditionValueType;
  string: string | null;
  array: string[] | null;
  number: number | null;
}

export interface LoadService_service_attributes_validations_dependentOn_conditions {
  attribute: string;
  op: ServiceAttributeConditionalOp;
  value: LoadService_service_attributes_validations_dependentOn_conditions_value;
}

export interface LoadService_service_attributes_validations_dependentOn {
  clause: ServiceAttributeConditionalClause;
  conditions: LoadService_service_attributes_validations_dependentOn_conditions[];
}

export interface LoadService_service_attributes_validations {
  dependentOn: LoadService_service_attributes_validations_dependentOn;
  message: string;
  reportOnly: boolean;
}

export interface LoadService_service_attributes_conditionalValues_dependentOn_conditions_value {
  type: ServiceAttributeConditionValueType;
  string: string | null;
  array: string[] | null;
  number: number | null;
}

export interface LoadService_service_attributes_conditionalValues_dependentOn_conditions {
  attribute: string;
  op: ServiceAttributeConditionalOp;
  value: LoadService_service_attributes_conditionalValues_dependentOn_conditions_value;
}

export interface LoadService_service_attributes_conditionalValues_dependentOn {
  clause: ServiceAttributeConditionalClause;
  conditions: LoadService_service_attributes_conditionalValues_dependentOn_conditions[];
}

export interface LoadService_service_attributes_conditionalValues_values {
  key: string;
  name: string;
}

export interface LoadService_service_attributes_conditionalValues {
  dependentOn: LoadService_service_attributes_conditionalValues_dependentOn;
  values: LoadService_service_attributes_conditionalValues_values[];
}

export interface LoadService_service_attributes_dependencies_conditions_value {
  type: ServiceAttributeConditionValueType;
  string: string | null;
  array: string[] | null;
  number: number | null;
}

export interface LoadService_service_attributes_dependencies_conditions {
  attribute: string;
  op: ServiceAttributeConditionalOp;
  value: LoadService_service_attributes_dependencies_conditions_value;
}

export interface LoadService_service_attributes_dependencies {
  clause: ServiceAttributeConditionalClause;
  conditions: LoadService_service_attributes_dependencies_conditions[];
}

export interface LoadService_service_attributes {
  required: boolean;
  type: ServiceAttributeDatatype;
  code: string;
  description: string;
  values: LoadService_service_attributes_values[] | null;
  validations: LoadService_service_attributes_validations[];
  conditionalValues: LoadService_service_attributes_conditionalValues[] | null;
  dependencies: LoadService_service_attributes_dependencies | null;
}

export interface LoadService_service {
  name: string;
  description: string | null;
  code: string;
  contactRequirement: MetadataRequirement;
  locationRequirement: MetadataRequirement;
  attributes: LoadService_service_attributes[];
}

export interface LoadService {
  service: LoadService_service | null;
}

export interface LoadServiceVariables {
  code: string;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: LoadTopServiceSummaries
// ====================================================

export interface LoadTopServiceSummaries_topServices {
  code: string;
  name: string;
  description: string | null;
  group: string | null;
}

export interface LoadTopServiceSummaries {
  topServices: LoadTopServiceSummaries_topServices[];
}

export interface LoadTopServiceSummariesVariables {
  first: number;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ReverseGeocode
// ====================================================

export interface ReverseGeocode_geocoder_reverse_location {
  lat: number;
  lng: number;
}

export interface ReverseGeocode_geocoder_reverse_units {
  address: string;
  streetAddress: string;
  unit: string;
  addressId: string;
}

export interface ReverseGeocode_geocoder_reverse {
  location: ReverseGeocode_geocoder_reverse_location;
  address: string;
  addressId: string | null;
  exact: boolean;
  alwaysUseLatLng: boolean;
  units: ReverseGeocode_geocoder_reverse_units[];
}

export interface ReverseGeocode_geocoder {
  reverse: ReverseGeocode_geocoder_reverse | null;
}

export interface ReverseGeocode {
  geocoder: ReverseGeocode_geocoder;
}

export interface ReverseGeocodeVariables {
  location: LatLngIn;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SearchAddress
// ====================================================

export interface SearchAddress_geocoder_search_location {
  lat: number;
  lng: number;
}

export interface SearchAddress_geocoder_search_units {
  address: string;
  streetAddress: string;
  unit: string;
  addressId: string;
}

export interface SearchAddress_geocoder_search {
  location: SearchAddress_geocoder_search_location;
  address: string;
  addressId: string | null;
  exact: boolean;
  alwaysUseLatLng: boolean;
  units: SearchAddress_geocoder_search_units[];
}

export interface SearchAddress_geocoder {
  search: SearchAddress_geocoder_search[];
}

export interface SearchAddress {
  geocoder: SearchAddress_geocoder;
}

export interface SearchAddressVariables {
  query: string;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SearchCases
// ====================================================

export interface SearchCases_searchCases_cases_images {
  squareThumbnailUrl: string;
}

export interface SearchCases_searchCases_cases_location {
  lat: number;
  lng: number;
}

export interface SearchCases_searchCases_cases_service {
  name: string;
}

export interface SearchCases_searchCases_cases {
  id: string;
  status: string;
  description: string | null;
  address: string | null;
  images: SearchCases_searchCases_cases_images[];
  requestedAt: number | null;
  requestedAtRelativeString: string | null;
  location: SearchCases_searchCases_cases_location | null;
  service: SearchCases_searchCases_cases_service;
}

export interface SearchCases_searchCases {
  query: string;
  cases: SearchCases_searchCases_cases[];
}

export interface SearchCases {
  searchCases: SearchCases_searchCases;
}

export interface SearchCasesVariables {
  query?: string | null;
  topLeft?: LatLngIn | null;
  bottomRight?: LatLngIn | null;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SubmitCase
// ====================================================

export interface SubmitCase_createCase_service {
  name: string;
  code: string;
}

export interface SubmitCase_createCase_location {
  lat: number;
  lng: number;
}

export interface SubmitCase_createCase_images {
  tags: string[];
  originalUrl: string;
  squarePreviewUrl: string;
}

export interface SubmitCase_createCase {
  id: string;
  service: SubmitCase_createCase_service;
  status: string;
  serviceNotice: string | null;
  closureReason: string | null;
  closureComment: string | null;
  description: string | null;
  address: string | null;
  location: SubmitCase_createCase_location | null;
  images: SubmitCase_createCase_images[];
  requestedAtString: string | null;
  updatedAtString: string | null;
  expectedAtString: string | null;
}

export interface SubmitCase {
  createCase: SubmitCase_createCase;
}

export interface SubmitCaseVariables {
  code: string;
  description: string;
  descriptionForClassifier: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  addressId?: string | null;
  location?: LatLngIn | null;
  mediaUrl?: string | null;
  attributes: CreateCaseAttribute[];
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum MetadataRequirement {
  HIDDEN = "HIDDEN",
  REQUIRED = "REQUIRED",
  VISIBLE = "VISIBLE",
}

export enum ServiceAttributeConditionValueType {
  NUMBER = "NUMBER",
  STRING = "STRING",
  STRING_ARRAY = "STRING_ARRAY",
}

export enum ServiceAttributeConditionalClause {
  AND = "AND",
  OR = "OR",
}

export enum ServiceAttributeConditionalOp {
  eq = "eq",
  gt = "gt",
  gte = "gte",
  in = "in",
  lt = "lt",
  lte = "lte",
  neq = "neq",
}

export enum ServiceAttributeDatatype {
  BOOLEAN_CHECKBOX = "BOOLEAN_CHECKBOX",
  DATE = "DATE",
  DATETIME = "DATETIME",
  INFORMATIONAL = "INFORMATIONAL",
  MULTIVALUELIST = "MULTIVALUELIST",
  NUMBER = "NUMBER",
  SINGLEVALUELIST = "SINGLEVALUELIST",
  STRING = "STRING",
  TEXT = "TEXT",
}

export interface CreateCaseAttribute {
  code: string;
  value: string;
}

export interface LatLngIn {
  lat: number;
  lng: number;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
