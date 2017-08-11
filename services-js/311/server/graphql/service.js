// @flow

import type {
  Service,
  ServiceMetadata,
  ServiceMetadataAttribute,
  ServiceMetadataAttributeValue,
  PlainValue,
  ConditionalValues,
  DependentConditions,
  DependentCondition,
} from '../services/Open311';
import type { Context } from '.';

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

export type ServiceStub = {|
  service_name: string,
  service_code: string,
|};

export type Root = Service | ServiceStub;

// Here we filter the disjoint union type of {key/value} vs. {dependendOn/values}
// down to just key/value pairs. A bit odd because of Flow.
export function filterPlainValues(
  mixedValues: ?(ServiceMetadataAttributeValue[] | number)
) {
  if (!mixedValues || typeof mixedValues === 'number') {
    return null;
  }

  const plainValues: {| key: string, name: string |}[] = [];

  mixedValues.forEach(value => {
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

export function filterConditionalValues(
  mixedValues: ?(ServiceMetadataAttributeValue[] | number)
) {
  if (!mixedValues || typeof mixedValues === 'number') {
    return null;
  }

  const conditionalValues: ConditionalValues[] = [];

  mixedValues.forEach(value => {
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

const makeMetadataResolver = (
  cb: (metadata: ?ServiceMetadata) => mixed
) => async (s: Root, args: mixed, { open311 }: Context) =>
  cb(
    s.metadata !== false ? await open311.serviceMetadata(s.service_code) : null
  );

type MetadataRequirement = 'REQUIRED' | 'VISIBLE' | 'HIDDEN';

function resolveMetadataRequirement(
  metadata: ?ServiceMetadata,
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

  const definition: ?{ required: boolean, visible: boolean } =
    definitions[definitionKey];
  const required: ?boolean = definitions[requiredKey];

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
      (metadata: ?ServiceMetadata) => (metadata ? metadata.attributes : [])
    ),
    locationRequired: makeMetadataResolver(
      (metadata: ?ServiceMetadata) =>
        resolveMetadataRequirement(
          metadata,
          'location',
          'location_required'
        ) === 'REQUIRED'
    ),
    locationRequirement: makeMetadataResolver((metadata: ?ServiceMetadata) =>
      resolveMetadataRequirement(metadata, 'location', 'location_required')
    ),
    contactRequired: makeMetadataResolver(
      (metadata: ?ServiceMetadata) =>
        resolveMetadataRequirement(metadata, 'reporter', 'contact_required') ===
        'REQUIRED'
    ),
    contactRequirement: makeMetadataResolver((metadata: ?ServiceMetadata) =>
      resolveMetadataRequirement(metadata, 'reporter', 'contact_required')
    ),
  },

  ServiceAttribute: {
    type: (a: ServiceMetadataAttribute) =>
      a.datatype.toUpperCase().replace(' ', '_').replace(/[()]/g, ''),
    values: (a: ServiceMetadataAttribute): null | PlainValue[] =>
      filterPlainValues(a.values),
    conditionalValues: (
      a: ServiceMetadataAttribute
    ): null | ConditionalValues[] => filterConditionalValues(a.values),
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
};
