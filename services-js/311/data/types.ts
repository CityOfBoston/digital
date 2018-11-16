// Friendlier versions of the auto-created GraphQL types
import {
  LoadCase,
  LoadService,
  LoadServiceSummaries,
  SubmitCase,
  SearchCases,
  ServiceAttributeDatatype,
  SearchAddress,
  ReverseGeocode,
} from './queries/types';

export type ServiceSummary = LoadServiceSummaries['services'][0];
export type Service = NonNullable<LoadService['service']>;
export type ServiceAttribute = Service['attributes'][0];
export type ServiceAttributeValuesConditionSet = NonNullable<
  ServiceAttribute['conditionalValues']
>[0]['dependentOn'];
export type ServiceAttributeValuesCondition = ServiceAttributeValuesConditionSet['conditions'][0];

export interface CalculatedAttribute {
  required: boolean;
  type: ServiceAttributeDatatype;
  code: string;
  description: string;
  values:
    | Array<{
        key: string;
        name: string;
      }>
    | undefined;
}
export type SubmittedRequest = SubmitCase['createCase'];
export type Request = NonNullable<LoadCase['case']>;
export type SearchCasesResult = SearchCases['searchCases'];
export type SearchCase = SearchCasesResult['cases'][0];
export type SearchAddressPlace = SearchAddress['geocoder']['search'][0];
export type AddressUnit = NonNullable<SearchAddressPlace['units'][0]>;

export type ReverseGeocodeResult = ReverseGeocode['geocoder']['reverse'];
