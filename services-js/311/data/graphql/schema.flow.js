/* @flow */
//  This file was automatically generated and should not be edited.

export type ServiceMetadataAttributeDatatype =
  "BOOLEAN_CHECKBOX" |
  "INFORMATIONAL" |
  "MULTIVALUELIST" |
  "NUMBER" |
  "DATETIME" |
  "DATE" |
  "SINGLEVALUELIST" |
  "STRING" |
  "TEXT";


export type ServiceMetadataAttributeConditionalClause =
  "AND" |
  "OR";


export type ServiceMetadataAttributeConditionalOp =
  "eq" |
  "neq" |
  "in" |
  "gt" |
  "gte" |
  "lt" |
  "lte";


export type ServiceMetadataAttributeConditionValueType =
  "STRING" |
  "STRING_ARRAY" |
  "NUMBER";


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
        conditionalValues: ?Array< {
          dependentOn: {
            clause: ServiceMetadataAttributeConditionalClause,
            conditions: Array< {
              attribute: string,
              op: ServiceMetadataAttributeConditionalOp,
              value: {
                type: ?ServiceMetadataAttributeConditionValueType,
                string: ?string,
                array: ?Array< string >,
                number: ?number,
              },
            } >,
          },
          values: Array< {
            key: string,
            name: string,
          } >,
        } >,
        dependencies: ? {
          clause: ServiceMetadataAttributeConditionalClause,
          conditions: Array< {
            attribute: string,
            op: ServiceMetadataAttributeConditionalOp,
            value: {
              type: ?ServiceMetadataAttributeConditionValueType,
              string: ?string,
              array: ?Array< string >,
              number: ?number,
            },
          } >,
        },
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