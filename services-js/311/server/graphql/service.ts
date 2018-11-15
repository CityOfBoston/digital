import {
  Service,
  ServiceMetadata,
  ServiceMetadataAttribute,
  PlainValue,
  ConditionalValues,
  Validation,
  DependentConditions,
  DependentCondition,
  isPlainValue,
  isConditionalValues,
} from '../services/Open311';

import { Context } from '.';

export const Schema = `
enum MetadataRequirement {
  REQUIRED
  VISIBLE
  HIDDEN
}

type Service {
  code: String!
  name: String!
  description: String
  group: String
  attributes: [ServiceAttribute!]!
  locationRequirement: MetadataRequirement!
  contactRequirement: MetadataRequirement!
  locationRequired: Boolean!
  contactRequired: Boolean!
}

type ServiceAttribute {
  type: ServiceAttributeDatatype!
  required: Boolean!
  description: String!
  code: String!
  dependencies: ServiceAttributeConditional
  validations: [ServiceAttributeValidation!]!
  values: [ServiceAttributeValue!]
  conditionalValues: [ServiceAttributeConditionalValues!]
}

type ServiceAttributeValue {
  key: String!
  name: String!
}

type ServiceAttributeConditional {
  clause: ServiceAttributeConditionalClause!
  conditions: [ServiceAttributeCondition!]!
}

type ServiceAttributeConditionalValues {
  dependentOn: ServiceAttributeConditional!,
  values: [ServiceAttributeValue!]!
}

type ServiceAttributeConditionValue {
  type: ServiceAttributeConditionValueType
  string: String
  array: [String!]
  number: Float
}

type ServiceAttributeCondition {
  attribute: String!
  op: ServiceAttributeConditionalOp!
  value: ServiceAttributeConditionValue!
}

type ServiceAttributeValidation {
  dependentOn: ServiceAttributeConditional!
  message: String!
  reportOnly: Boolean!
}

enum ServiceAttributeDatatype {
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

enum ServiceAttributeConditionalClause {
  AND
  OR
}

enum ServiceAttributeConditionalOp {
  eq
  neq
  in
  gt
  gte
  lt
  lte
}

enum ServiceAttributeConditionValueType {
  STRING
  STRING_ARRAY
  NUMBER
}
`;

export interface ServiceStub {
  service_name: string;
  service_code: string;
}

export type Root = Service | ServiceStub;

const makeMetadataResolver = (
  cb: ((metadata: ServiceMetadata | null) => {})
) => async (s: Root, _args: {}, { open311 }: Context) =>
  cb(
    ((s as any).metadata && (await open311.serviceMetadata(s.service_code))) ||
      null
  );
type MetadataRequirement = 'REQUIRED' | 'VISIBLE' | 'HIDDEN';

function resolveMetadataRequirement(
  metadata: ServiceMetadata | null,
  definitionKey: string,
  requiredKey: string
): MetadataRequirement {
  if (!metadata) {
    return 'REQUIRED';
  }

  const { definitions } = metadata;
  if (!definitions) {
    return 'REQUIRED';
  }

  const definition: { required: boolean; visible: boolean } | undefined =
    definitions[definitionKey];
  const required: boolean | undefined = definitions[requiredKey];

  if (definition) {
    if (definition.required) {
      return 'REQUIRED';
    } else if (definition.visible) {
      return 'VISIBLE';
    } else {
      return 'HIDDEN';
    }
  } else if (required) {
    return 'REQUIRED';
  } else {
    return 'VISIBLE';
  }
}

export const resolvers = {
  Service: {
    code: (s: Root) => s.service_code,
    name: (s: Root) => s.service_name || '',
    attributes: makeMetadataResolver(
      metadata => (metadata ? metadata.attributes : [])
    ),

    locationRequired: makeMetadataResolver(
      metadata =>
        resolveMetadataRequirement(
          metadata,
          'location',
          'location_required'
        ) === 'REQUIRED'
    ),

    locationRequirement: makeMetadataResolver(metadata =>
      resolveMetadataRequirement(metadata, 'location', 'location_required')
    ),

    contactRequired: makeMetadataResolver(
      metadata =>
        resolveMetadataRequirement(metadata, 'reporter', 'contact_required') ===
        'REQUIRED'
    ),

    contactRequirement: makeMetadataResolver(metadata =>
      resolveMetadataRequirement(metadata, 'reporter', 'contact_required')
    ),
  },

  ServiceAttribute: {
    type: (a: ServiceMetadataAttribute) =>
      a.datatype
        .toUpperCase()
        .replace(' ', '_')
        .replace(/[()]/g, ''),
    values: (a: ServiceMetadataAttribute): null | PlainValue[] =>
      Array.isArray(a.values) ? a.values.filter(isPlainValue) : null,
    conditionalValues: (
      a: ServiceMetadataAttribute
    ): null | ConditionalValues[] =>
      Array.isArray(a.values) ? a.values.filter(isConditionalValues) : null,
    validations: (
      a: // Safety to make sure we always have a dependentOn value.
      ServiceMetadataAttribute
    ): Validation[] =>
      (a.validations || []).filter(({ dependentOn }) => !!dependentOn),
    dependencies: (a: ServiceMetadataAttribute): null | DependentConditions =>
      a.dependencies || null,
  },

  ServiceAttributeCondition: {
    // getting around the polymorphism from the Open311 API. Our generated
    // Flow types don't handle unions very well, so we do a faux union by
    // just providing each of the types.
    value: (a: DependentCondition) => {
      if (Array.isArray(a.value)) {
        return {
          type: 'STRING_ARRAY',
          string: null,
          array: a.value,
          number: null,
        };
      } else if (typeof a.value === 'number') {
        return {
          type: 'NUMBER',
          string: null,
          array: null,
          number: a.value,
        };
      } else {
        return {
          type: 'STRING',
          string: a.value,
          array: null,
          number: null,
        };
      }
    },
  },

  // Just using the default key / value resolvers
  ServiceAttributeValue: {},

  ServiceAttributeValidation: {
    message: (v: Validation): string => v.message || '',
    reportOnly: (v: Validation): boolean => !!v.reportOnly,
  },
};
