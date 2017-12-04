/* @flow */
//  This file was automatically generated and should not be edited.

export type MetadataRequirement =
  "REQUIRED" |
  "VISIBLE" |
  "HIDDEN";


export type ServiceAttributeDatatype =
  "BOOLEAN_CHECKBOX" |
  "INFORMATIONAL" |
  "MULTIVALUELIST" |
  "NUMBER" |
  "DATETIME" |
  "DATE" |
  "SINGLEVALUELIST" |
  "STRING" |
  "TEXT";


export type ServiceAttributeConditionalClause =
  "AND" |
  "OR";


export type ServiceAttributeConditionalOp =
  "eq" |
  "neq" |
  "in" |
  "gt" |
  "gte" |
  "lt" |
  "lte";


export type ServiceAttributeConditionValueType =
  "STRING" |
  "STRING_ARRAY" |
  "NUMBER";


export type LatLngIn = {|
  lat: number,
  lng: number,
|};

export type CreateCaseAttribute = {|
  code: string,
  value: string,
|};

export type LoadCaseQueryVariables = {|
  id: string,
|};

export type LoadCaseQuery = {|
  case: ? {|
    id: string,
    service: {|
      name: string,
      code: string,
    |},
    status: string,
    serviceNotice: ?string,
    closureReason: ?string,
    closureComment: ?string,
    description: ?string,
    address: ?string,
    location: ? {|
      lat: number,
      lng: number,
    |},
    images:  Array< {|
      tags: Array< string >,
      originalUrl: string,
      squarePreviewUrl: string,
    |} >,
    requestedAtString: ?string,
    updatedAtString: ?string,
    expectedAtString: ?string,
  |},
|};

export type LoadServiceQueryVariables = {|
  code: string,
|};

export type LoadServiceQuery = {|
  service: ? {|
    name: string,
    description: ?string,
    code: string,
    contactRequirement: MetadataRequirement,
    locationRequirement: MetadataRequirement,
    attributes:  Array< {|
      required: boolean,
      type: ServiceAttributeDatatype,
      code: string,
      description: string,
      values: ? Array< {|
        key: string,
        name: string,
      |} >,
      validations:  Array< {|
        dependentOn: {|
          clause: ServiceAttributeConditionalClause,
          conditions:  Array< {|
            attribute: string,
            op: ServiceAttributeConditionalOp,
            value: {|
              type: ?ServiceAttributeConditionValueType,
              string: ?string,
              array: ?Array< string >,
              number: ?number,
            |},
          |} >,
        |},
        message: string,
        reportOnly: boolean,
      |} >,
      conditionalValues: ? Array< {|
        dependentOn: {|
          clause: ServiceAttributeConditionalClause,
          conditions:  Array< {|
            attribute: string,
            op: ServiceAttributeConditionalOp,
            value: {|
              type: ?ServiceAttributeConditionValueType,
              string: ?string,
              array: ?Array< string >,
              number: ?number,
            |},
          |} >,
        |},
        values:  Array< {|
          key: string,
          name: string,
        |} >,
      |} >,
      dependencies: ? {|
        clause: ServiceAttributeConditionalClause,
        conditions:  Array< {|
          attribute: string,
          op: ServiceAttributeConditionalOp,
          value: {|
            type: ?ServiceAttributeConditionValueType,
            string: ?string,
            array: ?Array< string >,
            number: ?number,
          |},
        |} >,
      |},
    |} >,
  |},
|};

export type LoadServiceSuggestionsQueryVariables = {|
  text: string,
|};

export type LoadServiceSuggestionsQuery = {|
  servicesForDescription:  Array< {|
    name: string,
    code: string,
    description: ?string,
    group: ?string,
  |} >,
|};

export type LoadServiceSummariesQuery = {|
  services:  Array< {|
    code: string,
    name: string,
    description: ?string,
    group: ?string,
  |} >,
|};

export type LoadTopServiceSummariesQueryVariables = {|
  first: number,
|};

export type LoadTopServiceSummariesQuery = {|
  topServices:  Array< {|
    code: string,
    name: string,
    description: ?string,
    group: ?string,
  |} >,
|};

export type ReverseGeocodeQueryVariables = {|
  location: LatLngIn,
|};

export type ReverseGeocodeQuery = {|
  geocoder: {|
    reverse: ? {|
      location: {|
        lat: number,
        lng: number,
      |},
      address: string,
      addressId: ?string,
      exact: boolean,
      alwaysUseLatLng: boolean,
      units:  Array< {|
        address: string,
        streetAddress: string,
        unit: string,
        addressId: string,
      |} >,
    |},
  |},
|};

export type SearchAddressQueryVariables = {|
  query: string,
|};

export type SearchAddressQuery = {|
  geocoder: {|
    search:  Array< {|
      location: {|
        lat: number,
        lng: number,
      |},
      address: string,
      addressId: ?string,
      exact: boolean,
      alwaysUseLatLng: boolean,
      units:  Array< {|
        address: string,
        streetAddress: string,
        unit: string,
        addressId: string,
      |} >,
    |} >,
  |},
|};

export type SearchCasesQueryVariables = {|
  query?: ?string,
  topLeft?: ?LatLngIn,
  bottomRight?: ?LatLngIn,
|};

export type SearchCasesQuery = {|
  searchCases: {|
    query: string,
    cases:  Array< {|
      id: string,
      status: string,
      description: ?string,
      address: ?string,
      images:  Array< {|
        squareThumbnailUrl: string,
      |} >,
      requestedAt: ?number,
      requestedAtRelativeString: ?string,
      location: ? {|
        lat: number,
        lng: number,
      |},
      service: {|
        name: string,
      |},
    |} >,
  |},
|};

export type SubmitCaseMutationVariables = {|
  code: string,
  description: string,
  descriptionForClassifier: string,
  firstName?: ?string,
  lastName?: ?string,
  email?: ?string,
  phone?: ?string,
  address?: ?string,
  addressId?: ?string,
  location?: ?LatLngIn,
  mediaUrl?: ?string,
  attributes: Array< CreateCaseAttribute >,
|};

export type SubmitCaseMutation = {|
  createCase: {|
    id: string,
    service: {|
      name: string,
      code: string,
    |},
    status: string,
    serviceNotice: ?string,
    closureReason: ?string,
    closureComment: ?string,
    description: ?string,
    address: ?string,
    location: ? {|
      lat: number,
      lng: number,
    |},
    images:  Array< {|
      tags: Array< string >,
      originalUrl: string,
      squarePreviewUrl: string,
    |} >,
    requestedAtString: ?string,
    updatedAtString: ?string,
    expectedAtString: ?string,
  |},
|};