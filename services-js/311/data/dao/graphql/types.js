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

export type CreateRequestAttribute = {|
  code: string,
  value: string,
|};

export type LoadRequestQueryVariables = {|
  id: string,
|};

export type LoadRequestQuery = {|
  case: ? {|
    id: string,
    service: {|
      name: string,
    |},
    status: string,
    statusNotes: ?string,
    description: ?string,
    address: ?string,
    location: ? {|
      lat: number,
      lng: number,
    |},
    mediaUrl: ?string,
    requestedAtString: string,
    updatedAtString: string,
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
    search: ? {|
      location: {|
        lat: number,
        lng: number,
      |},
      address: string,
      addressId: ?string,
      units:  Array< {|
        address: string,
        streetAddress: string,
        unit: string,
        addressId: string,
      |} >,
    |},
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
      mediaUrl: ?string,
      requestedAt: number,
      requestedAtRelativeString: string,
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

export type SubmitRequestMutationVariables = {|
  code: string,
  description: string,
  firstName?: ?string,
  lastName?: ?string,
  email?: ?string,
  phone?: ?string,
  address?: ?string,
  addressId?: ?string,
  location?: ?LatLngIn,
  mediaUrl?: ?string,
  attributes: Array< CreateRequestAttribute >,
|};

export type SubmitRequestMutation = {|
  createRequest: {|
    id: string,
    service: {|
      name: string,
    |},
    status: string,
    statusNotes: ?string,
    description: ?string,
    address: ?string,
    location: ? {|
      lat: number,
      lng: number,
    |},
    mediaUrl: ?string,
    requestedAtString: string,
    updatedAtString: string,
  |},
|};