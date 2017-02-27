/* @flow */
//  This file was automatically generated and should not be edited.

export type ServiceMetadataAttributeDatatype =
  "BOOLEAN_CHECKBOX" |
  "INFORMATIONAL" |
  "MULTIVALUELIST" |
  "NUMBER" |
  "DATETIME" |
  "SINGLEVALUELIST" |
  "STRING" |
  "TEXT";


export type LatLng = {
  lat: number,
  lng: number,
};

export type CreateRequestAttribute = {
  code: string,
  value: string,
};

export type LoadServiceQueryVariables = {
  code: string,
};

export type LoadServiceQuery = {
  service: ? {
    name: string,
    code: string,
    hasMetadata: boolean,
    metadata: ? {
      attributes: Array< {
        required: boolean,
        type: ServiceMetadataAttributeDatatype,
        code: string,
        description: string,
        values: ?Array< {
          key: string,
          name: string,
        } >,
      } >,
    },
  },
};

export type LoadServiceSummariesQuery = {
  services: Array< {
    code: string,
    name: string,
    hasMetadata: boolean,
    locationRequired: boolean,
  } >,
};

export type SubmitRequestMutationVariables = {
  code: string,
  description: string,
  firstName: ?string,
  lastName: ?string,
  email: ?string,
  phone: ?string,
  address: ?string,
  location: ?LatLng,
  attributes: Array< CreateRequestAttribute >,
};

export type SubmitRequestMutation = {
  createRequest: {
    id: string,
    status: string,
    requestedAt: number,
  },
};