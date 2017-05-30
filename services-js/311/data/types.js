// @flow

// Friendlier versions of the auto-created GraphQL types

import type {
  LoadRequestQuery,
  LoadServiceQuery,
  LoadServiceSummariesQuery,
  SubmitRequestMutation,
  SearchRequestsQuery,
  ServiceAttributeDatatype,
  ReverseGeocodeQuery,
  SearchAddressQuery,
} from './dao/graphql/types';

export type ServiceSummary = $ArrayElement<$PropertyType<LoadServiceSummariesQuery, 'services'>>;
export type Service = $NonMaybeType<$PropertyType<LoadServiceQuery, 'service'>>;
export type ServiceAttribute = $ArrayElement<$PropertyType<Service, 'attributes'>>;
export type ServiceAttributeValuesConditionSet = $PropertyType<$ArrayElement<$NonMaybeType<$PropertyType<ServiceAttribute, 'conditionalValues'>>>, 'dependentOn'>;
export type ServiceAttributeValuesCondition = $ArrayElement<$PropertyType<ServiceAttributeValuesConditionSet, 'conditions'>>;
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

export type SubmittedRequest = $PropertyType<SubmitRequestMutation, 'createRequest'>;
export type Request = $NonMaybeType<$PropertyType<LoadRequestQuery, 'request'>>;

export type SearchRequestsPage = $PropertyType<SearchRequestsQuery, 'requests'>;
export type SearchRequest = $ArrayElement<$PropertyType<SearchRequestsPage, 'requests'>>;

export type ReverseGeocodedPlace = $NonMaybeType<$PropertyType<$PropertyType<ReverseGeocodeQuery, 'geocoder'>, 'reverse'>>;
export type SearchAddressPlace = $NonMaybeType<$PropertyType<$PropertyType<SearchAddressQuery, 'geocoder'>, 'search'>>;
export type AddressUnit = $NonMaybeType<$ArrayElement<$PropertyType<SearchAddressPlace, 'units'>>>;
