/* @flow */
//  This file was automatically generated and should not be edited.

export type ServiceMetadataAttributeDatatype =
  "text" |
  "informational" |
  "picklist";


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

export type ServicesLoadQuery = {
  services: Array< {
    code: string,
    name: string,
    hasMetadata: boolean,
  } >,
};

export type ServicesLoadMetadataQueryVariables = {
  code: string,
};

export type ServicesLoadMetadataQuery = {
  serviceMetadata: ? {
    attributes: Array< {
      required: boolean,
      type: ServiceMetadataAttributeDatatype,
      code: string,
      order: ?number,
      description: string,
      values: ?Array< {
        key: string,
        value: string,
      } >,
    } >,
  },
};