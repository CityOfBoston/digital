// @flow

// Friendlier versions of the auto-created GraphQL types

import type {
  LoadCaseQuery,
  LoadServiceQuery,
  LoadServiceSummariesQuery,
  SubmitCaseMutation,
  SearchCasesQuery,
  ServiceAttributeDatatype,
  SearchAddressQuery,
} from './dao/graphql/types';

export type ServiceSummary = $ArrayElement<
  $PropertyType<LoadServiceSummariesQuery, 'services'>
>;
export type Service = $NonMaybeType<$PropertyType<LoadServiceQuery, 'service'>>;
export type ServiceAttribute = $ArrayElement<
  $PropertyType<Service, 'attributes'>
>;
export type ServiceAttributeValuesConditionSet = $PropertyType<
  $ArrayElement<
    $NonMaybeType<$PropertyType<ServiceAttribute, 'conditionalValues'>>
  >,
  'dependentOn'
>;
export type ServiceAttributeValuesCondition = $ArrayElement<
  $PropertyType<ServiceAttributeValuesConditionSet, 'conditions'>
>;
export type CalculatedAttribute = {
  required: boolean,
  type: ServiceAttributeDatatype,
  code: string,
  description: string,
  values: ?Array<{
    key: string,
    name: string,
  }>,
};

export type SubmittedRequest = $PropertyType<SubmitCaseMutation, 'createCase'>;
export type Request = $NonMaybeType<$PropertyType<LoadCaseQuery, 'case'>>;

export type SearchCasesResult = $PropertyType<SearchCasesQuery, 'searchCases'>;
export type SearchCase = $ArrayElement<
  $PropertyType<SearchCasesResult, 'cases'>
>;

export type SearchAddressPlace = $ArrayElement<
  $PropertyType<$PropertyType<SearchAddressQuery, 'geocoder'>, 'search'>
>;
export type AddressUnit = $NonMaybeType<
  $ArrayElement<$PropertyType<SearchAddressPlace, 'units'>>
>;
