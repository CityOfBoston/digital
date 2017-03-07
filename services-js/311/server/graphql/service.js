// @flow

import type {
  Service,
  ServiceMetadata,
  ServiceMetadataAttribute,
  ServiceMetadataAttributeValue,
  PlainValue,
  ConditionalValue,
} from '../services/Open311';
import type { Context } from '.';

export const Schema = `
type Service {
  code: String!
  name: String!
  locationRequired: Boolean!
  hasMetadata: Boolean!
  metadata: ServiceMetadata
}

type ServiceMetadata {
  attributes: [ServiceMetadataAttribute!]!
}

type ServiceMetadataAttribute {
  type: ServiceMetadataAttributeDatatype!
  required: Boolean!
  order: Int
  description: String!
  code: String!
  values: [ServiceMetadataAttributeValue!]
  conditionalValues: [ServiceMetadataAttributeConditionalValues!]
}

type ServiceMetadataAttributeValue {
  key: String!
  name: String!
}

type ServiceMetadataAttributeConditional {
  clause: ServiceMetadataAttributeConditionalClause!
  conditions: [ServiceMetadataAttributeCondition!]!
}

type ServiceMetadataAttributeConditionalValues {
  dependentOn: ServiceMetadataAttributeConditional!,
  values: [ServiceMetadataAttributeValue!]!
}

type ServiceMetadataAttributeCondition {
  attribute: String!
  op: ServiceMetadataAttributeConditionalOp!
  value: String!
}

enum ServiceMetadataAttributeDatatype {
  BOOLEAN_CHECKBOX
  INFORMATIONAL
  MULTIVALUELIST
  NUMBER
  DATETIME
  DATE
  SINGLEVALUELIST
  STRING
  TEXT
}

enum ServiceMetadataAttributeConditionalClause {
  AND
  OR
}

enum ServiceMetadataAttributeConditionalOp {
  eq
  neq
}
`;

export type Root = Service;

// TODO(finh): Either support this with authorization or delete Salesforce code
const USE_SALESFORCE = false;

// Here we filter the disjoint union type of {key/value} vs. {dependendOn/values}
// down to just key/value pairs. A bit odd because of Flow.
export function filterPlainValues(mixedValues: ?ServiceMetadataAttributeValue[]) {
  if (!mixedValues) {
    return null;
  }

  const plainValues: {| key: string, name: string |}[] = [];

  mixedValues.forEach((value) => {
    let key: ?string;
    let name: ?string;

    if (typeof value.key === 'string') {
      key = value.key;
    }

    if (typeof value.name === 'string') {
      name = value.name;
    }

    if (key && name) {
      plainValues.push({ key, name });
    }
  });

  return plainValues;
}

export function filterConditionalValues(mixedValues: ?ServiceMetadataAttributeValue[]) {
  if (!mixedValues) {
    return null;
  }

  const conditionalValues: ConditionalValue[] = [];

  mixedValues.forEach((value) => {
    let dependentOn;
    let values: PlainValue[];

    if (typeof value.dependentOn === 'object') {
      dependentOn = value.dependentOn;
    }

    if (Array.isArray(value.values)) {
      values = value.values;
    }

    if (dependentOn && values) {
      conditionalValues.push({ dependentOn, values });
    }
  });

  return conditionalValues;
}

export const resolvers = {
  Service: {
    code: (s: Service) => s.service_code,
    name: (s: Service) => s.service_name || '',
    locationRequired: async (s: Service, args: mixed, { salesforce }: Context) => {
      if (USE_SALESFORCE) {
        const serviceVersion = await salesforce.serviceVersion(s.service_code);
        if (!serviceVersion) {
          throw new Error(`Salesforce had no record for code ${s.service_code}`);
        }
        return serviceVersion.Incap311__Service_Location_Required__c;
      } else {
        return true;
      }
    },
    hasMetadata: (s: Service) => s.metadata,
    metadata: (s: Service, args: mixed, { open311 }: Context): ?Promise<ServiceMetadata> => (
      s.metadata ? open311.serviceMetadata(s.service_code) : null
    ),
  },

  ServiceMetadata: {
    attributes: (m: ServiceMetadata): ServiceMetadataAttribute[] => m.attributes,
  },

  ServiceMetadataAttribute: {
    type: (a: ServiceMetadataAttribute) => a.datatype.toUpperCase().replace(' ', '_').replace(/[()]/g, ''),
    required: (a: ServiceMetadataAttribute) => a.required,
    order: (a: ServiceMetadataAttribute) => a.order,
    code: (a: ServiceMetadataAttribute) => a.code,
    description: (a: ServiceMetadataAttribute) => a.description,
    values: (a: ServiceMetadataAttribute): null | PlainValue[] => filterPlainValues(a.values),
    conditionalValues: (a: ServiceMetadataAttribute): null | ConditionalValue[] => filterConditionalValues(a.values),
  },

  // Just using the default key / value resolvers
  ServiceMetadataAttributeValue: {},
};
