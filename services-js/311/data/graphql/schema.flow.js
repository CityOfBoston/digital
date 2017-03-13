/* @flow */
//  This file was automatically generated and should not be edited.

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


export type LatLng = {
  lat: number,
  lng: number,
};

export type CreateRequestAttribute = {
  code: string,
  value: string,
};

export type LoadRequestQueryVariables = {
  id: string,
};

export type LoadRequestQuery = {
  request: ? {
    id: string,
    service: {
      name: string,
    },
    status: string,
    description: ?string,
    address: string,
    requestedAtString: string,
    updatedAtString: string,
  },
};

export type LoadServiceQueryVariables = {
  code: string,
};

export type LoadServiceQuery = {
  service: ? {
    name: string,
    code: string,
    contactRequired: boolean,
    locationRequired: boolean,
    attributes: Array< {
      required: boolean,
      type: ServiceAttributeDatatype,
      code: string,
      description: string,
      values: ?Array< {
        key: string,
        name: string,
      } >,
      conditionalValues: ?Array< {
        dependentOn: {
          clause: ServiceAttributeConditionalClause,
          conditions: Array< {
            attribute: string,
            op: ServiceAttributeConditionalOp,
            value: {
              type: ?ServiceAttributeConditionValueType,
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
        clause: ServiceAttributeConditionalClause,
        conditions: Array< {
          attribute: string,
          op: ServiceAttributeConditionalOp,
          value: {
            type: ?ServiceAttributeConditionValueType,
            string: ?string,
            array: ?Array< string >,
            number: ?number,
          },
        } >,
      },
    } >,
  },
};

export type LoadServiceSummariesQuery = {
  services: Array< {
    code: string,
    name: string,
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