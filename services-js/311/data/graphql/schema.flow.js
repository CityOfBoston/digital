/* @flow */
//  This file was automatically generated and should not be edited.

export type ServiceMetadataAttributeDatatype =
  "TEXT" |
  "INFORMATIONAL" |
  "PICKLIST" |
  "BOOLEAN_CHECKBOX";


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
  } >,
};

export type RequestSubmitMutationVariables = {
  code: string,
  description: string,
  firstName: ?string,
  lastName: ?string,
  email: ?string,
  phone: ?string,
};

export type RequestSubmitMutation = {
  createRequest: ? {
    id: string,
  },
};